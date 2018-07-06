import * as mysql2 from 'mysql2/promise';
import { Connection } from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import * as Entities from 'html-entities';
import { AllHtmlEntities } from 'html-entities';

export class User implements IUser {
    public id: number;
    public alias: string;
    public email: string;

    public static connection: Connection; // connection to user database
    private static encoder: AllHtmlEntities = new Entities.AllHtmlEntities();

    constructor() {
        // Connect to MySQL database
        if (typeof User.connection === 'undefined') {
            console.log('model/user');
            User.connection = <Connection>{};
            (async function () {
                try {
                    await User.dbConnect()
                        .then(re => { console.log('!*database connected*!') })
                } catch (err) {
                    console.log(`model/user.ts constructor anonymous async connection error: ${err}`);
                    throw err;
                }
            })
        } else {
            // connection has already been defined
        }
    }

    public getId(): number {
        return this.id;
    }

    public getAlias(): string {
        return this.alias;
    }

    public getEmail(): string {
        return this.email;
    }

    public async getPassword(): Promise<string> {
        if (!User.validateId(this.id)) { return Promise.reject(`Invalid user id: ${this.id}`) }
        let query = 'SELECT id,password FROM `users` where `id` = ?'
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [this.id])
            .catch(error => { return Promise.reject(`Couldn't connect to database.`) })
        if (rows.length < 1) {
            return Promise.reject(`No password set for user with id: ${this.id}`)
        }
        return <string>rows[0].password;
    }

    public async getRecovery(): Promise<string> {
        if (!User.validateId(this.id)) { return Promise.reject(`Invalid user id: ${this.id}`) }
        let query = 'SELECT recovery FROM `users` where `id` = ?'
        console.log(`connection: ${User.connection}`)
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [this.id])
            .catch(error => { return Promise.reject(`Couldn't connect to database.`) })
        if (rows.length < 1 || !rows[0].recovery) {
            return Promise.reject(`No recovery set for user with id: ${this.id}`)
        }
        return <string>rows[0].recovery;
    }

    public async getRecoveryExpire(): Promise<Date> {
        if (!User.validateId(this.id)) { return Promise.reject(`Invalid user id: ${this.id}`) }
        let query = 'SELECT recoveryexpire FROM `users` where `id` = ?'
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [this.id])
            .catch(error => { return Promise.reject(`Couldn't connect to database.`) })
        if (rows.length < 1 || typeof rows[0].recoveryexpire === 'undefined') {
            return Promise.reject(`No recoveryexpire set for user id:${this.id}`)
        }
        return Promise.resolve(new Date(rows[0].recoveryexpire));
    }

    public async setId(id?: number): Promise<boolean> {
        if (!User.validateId(id)) { return Promise.reject(`Invalid user id: ${id}`) }
        // check if id already exists in database
        let query = "SELECT id FROM `users` WHERE `id` = ?";
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [id])
            .catch(error => { return Promise.reject(`Couldn't connect to database.`) })
        if (rows.length > 0) {
            return Promise.reject(`A user already has id: ${id}`)
        }
        // change id in database
        query = 'UPDATE users SET `id` = ? WHERE `id` = ?';
        let [r, f] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [id, this.id])
            .catch(error => { return Promise.reject(`Couldn't connect to database.`) })
        // update this
        this.id = id;
        return true
    }

    public async setAlias(alias: string): Promise<boolean> {
        if (!User.validateAlias(alias)) { return Promise.reject(`Invalid user alias: ${alias}`) }
        // check if alias already exists in database
        let query = "SELECT id, alias FROM `users` WHERE `alias` = ?";
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [alias])
            .catch(error => { return Promise.reject(`Couldn't connect to database.`) })
        if (rows.length > 0) {
            // user with this alias already exists, so reject
            return Promise.reject(`A user already has alias: ${alias}`)
        }
        // change alias in database
        query = 'UPDATE users SET `alias` = ? WHERE `id` = ?';
        let [r, f] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [alias, this.id])
            .catch(error => { return Promise.reject(`Couldn't connect to database.`) })
        // update this
        this.alias = alias;
        return true
    }

    public async setEmail(email: string): Promise<boolean> {
        if (!User.validateEmail(email)) { return Promise.reject(`Invalid user email: ${email}`) }
        // check if email already exists in database
        let query = "SELECT id, email FROM `users` WHERE `email` = ?";
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [email])
            .catch(error => { return Promise.reject(`Couldn't connect to database.`) })
        if (rows.length > 0) {
            // user with this email already exists, so reject
            return Promise.reject(`${email} is already registered by a user`)
        }
        // change email in database
        query = 'UPDATE users SET `email` = ? WHERE `id` = ?';
        let [r, f] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [email, this.id])
            .catch(error => { return Promise.reject(`Couldn't connect to database.`) })
        // update this
        this.email = email;
        return true
    }

    public async setPassword(password: string): Promise<boolean> {
        if (!User.validatePassword(password)) { return Promise.reject(`Invalid user password: ${'*'.repeat(password.length)}}`) }
        // generate salt & hash
        let salt = bcrypt.genSaltSync(4);
        let hash = await bcrypt.hash(password, salt)
            .catch((err) => { return Promise.reject(`Unable to hash password.`) });
        // update password in database
        let query = 'UPDATE `users` SET `password` = ? WHERE `id` = ?';
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(
            query, [hash, this.id])
            .catch((err) => { return Promise.reject(`Couldn't connect to database.`) });
        return true
    }

    public async setRecovery(recovery?: string): Promise<boolean> {
        // Only change recovery if a fresh recovery doesn't exist
        let currentExpiry: Date
        await this.getRecoveryExpire()
            .then(res => currentExpiry = new Date(res))
            .catch(err => {
                currentExpiry = new Date(Date.now()); // set to current date
            })
        let now = new Date(Date.now());
        if (currentExpiry > now) {
            // expiry token is still active, don't allow a new recovery to be set
            return Promise.reject(`This account's recovery token is still active.`)
        }
        // create a random recovery key if none provided
        const length: number = 128;
        recovery = recovery
            ? recovery
            : crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
        // hash the recovery key
        let _salt = bcrypt.genSaltSync(4)
        let _hash = await bcrypt.hash(recovery, _salt).catch(err => {
            return Promise.reject(`Unable to hash recovery key.`)
        })
        // store the recovery key, hash, and expiry date in the database
        const expirydate = new Date(Date.now() + 1000 * 60 * 60 * 4); // 4 hours
        let query = 'UPDATE `users` SET `recovery` = ?, `recoveryexpire` = ? WHERE `id` = ?'
        let [_rows, _fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [_hash, expirydate, this.id])
            .catch(err => { return Promise.reject(`Couldn't connect to database.`) })

        return true
    }

    public async isValidRecovery(id: number, recovery: string): Promise<boolean> {
        let query = "SELECT recovery, recoveryexpire FROM `users` where id = ?"
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [id])
            .catch((err) => { return Promise.reject(`Couldn't connect to database.`) });
        if (rows.length < 1) {
            return Promise.reject(`user id: ${id} not found in database`)
        }
        // check if hash matches
        if (!bcrypt.compareSync(recovery, rows[0].recovery)) {
            return Promise.reject(`Recovery key validation failed.`)
        }
        // check if recovery code has expired
        let expiry = new Date(rows[0].recoverexpiry)
        let now = new Date(Date.now());
        if (expiry < now) {
            return Promise.reject(`Recovery key expired`)
        }
        return true;
    }

    public static async set(alias: string, email: string, password: string, id?: number): Promise<boolean> {
        // validate input format
        if (typeof id !== 'undefined' && !User.validateId(id)) { return Promise.reject(`Invalid id: ${id}`); }
        if (!User.validateAlias(alias)) { return Promise.reject(`Invalid alias: ${alias}`); }
        if (!User.validateEmail(email)) { return Promise.reject(`Invalid email: ${email}`); }
        if (!User.validatePassword(password)) { return Promise.reject(`Invalid password: ${password}`); }
        // check uniqness of keys
        let query: string = (typeof id !== 'undefined')
            ? "SELECT * FROM `users` WHERE `id` = ? OR `alias` = ? OR `email` = ?"
            : "SELECT * FROM `users` WHERE `alias` = ? OR `email` = ?";
        let params: any[] = (typeof id !== 'undefined')
            ? [id, alias, email]
            : [alias, email];
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, params)
            .catch(error => { return Promise.reject(`Couldn't connect to database.`) })
        if (rows.length > 0) {
            return Promise.reject(`Account alias and email must be unique.`)
        }
        // create password hash & salt
        let salt: string | void = bcrypt.genSaltSync(4);
        let hash: string | void = await bcrypt.hash(password, salt).catch((e) => { });
        // create account
        query = (typeof id !== 'undefined')
            ? "INSERT INTO `users` (id, email, alias, password) VALUES(?, ?, ?, ?)"
            : "INSERT INTO `users` (email, alias, password) VALUES(?, ?, ?)";
        let _params: any[] = (typeof id !== 'undefined')
            ? [id, email, alias, hash]
            : [email, alias, hash];
        let [_rows, _fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, _params)
            .catch(error => { return Promise.reject(`Couldn't connect to database.`) })
        return true
    }

    public static async get(identifier: number | string, password?: string): Promise<User> {
        // get a non-static user object
        // TODO: if (!loggedIn && password == null) return Promise.reject(false)
        if (typeof identifier === 'undefined') {
            return Promise.reject('Error: User.get(identifier, password?) called, but identifier was undefined ')
        }
        let u: User = new User();
        let query: string;
        let params: any[] = [identifier]
        let key: string;
        // Users have three keys: id, alias, or email. See which one is used.
        key = typeof identifier === 'number' ? 'id' : identifier.includes('@') ? 'email' : 'alias';
        query = 'SELECT id, alias, email, password FROM `users` where `' + key + '` = ? LIMIT 1'
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, params)
            .catch(error => { return Promise.reject(`Couldn't connect to database.`) })
        u.id = rows[0].id;
        u.alias = rows[0].alias;
        u.email = rows[0].email;
        // err if password is incorrect
        if (password != null) {
            let valid = await bcrypt.compare(password, rows[0].password)
                .catch(e => { /* bcrypt error */return Promise.reject(false); });
            return valid ? u : Promise.reject(false);
        }
        return u;
    }

    public static async getId(email: string): Promise<number> {
        // connect to MySQL database first
        await User.dbConnect();
        // ensure email is valid
        if (!User.validateEmail(email)) {
            return Promise.reject('Invalid email');
        }
        // find id in database
        let query = 'SELECT id FROM `users` WHERE email = ? LIMIT 1';
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [email])
            .catch(e => { return Promise.reject(`Couldn't connect to database.`) });
        // reject if results empty
        if (rows.length < 1) {
            return Promise.reject(`User (email:${email}) does not exist.`)
        }
        console.log(`static async getId(${email}) => ${rows[0].id}. rows:${rows}`)
        // return the id
        return parseInt(rows[0].id)
    }

    public static async getAlias(id: number): Promise<string> {
        await User.dbConnect();
        if (!User.validateId(id)) {
            return Promise.reject('Invalid id');
        }
        let query = 'SELECT alias FROM `users` WHERE id = ? LIMIT 1'
        let [rows, fields] = await this.connection.execute<mysql2.RowDataPacket[]>(query, [id])
            .catch((e) => { return Promise.reject(`Couldn't connect to database.`); })
        if (rows.length < 1) {
            return Promise.reject(`User (id:${id}) does not exist.`)
        }
        return rows[0]['alias'];
    }

    public static async getEmail(id: number): Promise<string> {
        await User.dbConnect();
        if (!User.validateId(id)) {
            return Promise.reject('Invalid id');
        }
        let query = 'SELECT email FROM `users` WHERE id = ? LIMIT 1'
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [id])
            .catch((e) => { return Promise.reject(`Couldn't connect to database.`); })
        if (rows.length < 1) {
            return Promise.reject(`User (id:${id} does not exist.`)
        }
        return rows[0]['email']
    }

    public static async existsEmail(email: string) : Promise<boolean> {
        await User.dbConnect()
        let query = 'SELECT id FROM `users` WHERE email = ? LIMIT 1'
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [email])
            .catch((e) => { return Promise.reject(`Couldn't connect to database.`); })
        if (rows.length < 1) {
            return Promise.reject(`User (email:${email} does not exist.`)
        }
        return true;
    }

    public static async existsAlias(alias: string) : Promise<boolean> {
        await User.dbConnect()
        let query = 'SELECT id FROM `users` WHERE alias = ? LIMIT 1'
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [alias])
            .catch((e) => { return Promise.reject(`Couldn't connect to database.`); })
        if (rows.length < 1) {
            return Promise.reject(`User (alias:${alias} does not exist.`)
        }
        return true;
    }

    /**
     * Check if `email` and `password` match a user. Returns `boolean`.
     * 
     * @param email 
     * @param password 
     */
    public static async isValidLogin(email: string, password: string): Promise<boolean> {
        // connect to database
        await User.dbConnect();
        // validation
        if (!User.validateEmail(email)) {
            return Promise.reject('Invalid email.')
        }
        if (!User.validatePassword(password)) {
            return Promise.reject('Invalid password.')
        }
        // find user in database by email
        let query = 'SELECT `password` FROM `users` WHERE `email` = ? LIMIT 1';
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [email])
            .catch((e) => { /* db error */return Promise.reject(false); })
        // reject if no match in database
        if (rows.length < 1) {
            return false;
        }
        // validate password against user's stored password hash
        let valid: boolean = await bcrypt.compare(password, rows[0].password)
            .catch(e => { /* bcrypt error */return Promise.reject(false); });
        return valid;
    }

    /**
     * Check if `email` and `password` match a user. Returns `{success:boolean, user:User}`.
     * 
     * @param email 
     * @param password 
     */
    public static async authenticate(email: string, password: string): Promise<{ 'success': boolean, 'user'?: IUser }> {
        // connect to database
        await User.dbConnect();
        // validation
        if (!User.validateEmail(email)) {
            return Promise.reject('Invalid email.')
        }
        if (!User.validatePassword(password)) {
            return Promise.reject('Invalid password.')
        }
        // find user in database by email
        let query = 'SELECT `id`, `email`, `alias`, `password` FROM `users` WHERE `email` = ? LIMIT 1';
        let [rows, fields] = await User.connection.execute<mysql2.RowDataPacket[]>(query, [email])
            .catch((e) => { return Promise.reject('database error'); })
        // reject if no match in database
        if (rows.length < 1) {
            return Promise.reject('No user with that email');
        }
        // validate password against user's stored password hash
        let valid: boolean = await bcrypt.compare(password, rows[0].password)
            .catch(e => { return Promise.reject('bcrypt error'); });

        if (valid) {
            return { 'success': true, 'user': { 'id': rows[0].id, 'alias': rows[0].alias, 'email': rows[0].email } }
        } else {
            return Promise.reject('Invalid username or password');
        }
    }


    private static validateId(id: number): boolean {
        if (id < 1) { return false; }
        return true; // all validation passed
    }

    private static validateAlias(alias: string): boolean {
        if (alias.length < 1) { return false; }
        if (alias.length > 18) { return false; }
        let diff = User.encoder.encode(alias); // ensure no HTML entities in alias
        if (alias !== diff) { return false; }
        return true; // all validation passed
    }

    private static validateEmail(email: string): boolean {
        if (!RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/g).test(email)) {
            return false;
        }
        if (email.length < 5) { return false; }
        if (email.length > 255) { return false; }
        return true; // all validation passed
    }

    private static validatePassword(password: string): boolean {
        if (password.length < 1) { return false; }
        // bcrypt only uses first 72 charcters of password, but no reason to limit it
        return true; // all validation passed
    }

    private static validatePasswordHash(hash: string): boolean {
        if (hash.length < 60 || hash.length > 60) {
            return false;
        }
        return true;
    }

    private static validatePasswordSalt(salt: string): boolean {
        if (salt.length < 29 || salt.length > 29) {
            return false;
        }
        return true;
    }

    public static async dbConnect() {
        // console.log(`dbConnect()`)
        if (typeof User.connection === 'undefined') {
            try {
                User.connection = await mysql2.createConnection(
                    { host: "127.0.0.1", user: "root", password: "chollima", database: "users" })
                    .then(connection => {
                        // console.log('dbConnect(): connected @ ', new Date(Date.now()).getMilliseconds())
                        return connection;
                    })
            } catch (err) {
                console.log('dbConnect is throwing an error:', err)
                throw err
            }
        } else {
            return; // Already connected
        }
    }

    public static async forgot(email: string, message: nodemailer.SendMailOptions, transporter: nodemailer.Transporter): Promise<{ 'success': boolean, 'message': string }> {
        // get user id
        let user: User = new User(); // needed for non-static functions
        let id: number;
        // Generate a 128-bit recovery key and send to the user. We will hash the string and store it in
        // the database. When the user clicks the link, we will compare their submitted recovery key
        // against the recovery key hash in the database.
        let recovery: string = crypto.randomBytes(Math.ceil(128 / 2)).toString('hex').slice(0, 128);
        let recoveryExpiry: Date;
        await User.getId(email)
            .then((result: number) => { id = result; user.id = result })
            .catch(err => { return { 'success': false, 'message': err } })
        await user.setRecovery(recovery)
            .then((result: boolean) => { })
            .catch(err => { return { 'success': false, 'message': err } })
        await user.getRecoveryExpire()
            .then((result) => { recoveryExpiry = new Date(result) })
            .catch((err) => { return { 'success': false, 'message': err } })
        // Don't want to spam emails during development
        if (process.env.NODE_ENV !== 'production') {
            return { 'success': true, message: `An email was not sent to ${message.to} because the server is running in development mode.` }
        }
        // send the email
        await transporter.sendMail(message)
            .catch(err => { return { 'success': false, message: `Error: could not send email to ${message.to}. Perhaps ${message.from} is offline?` } })
        // hash the recovery key
        let _salt = bcrypt.genSaltSync(4)
        let _hash = await bcrypt.hash(recovery, _salt).catch(err => { return { 'success': false, message: `Couldn't hash password.` } })
        // These should have already been taken care of in the call to setRecovery...
        const expirydate = new Date(Date.now() + 1000 * 60 * 60 * 4); // 4 hours // store the recovery key in database
        await User.connection.execute('UPDATE `users` SET `recovery` = ?, `recoveryexpire` = ? WHERE `id` = ?', [_hash, expirydate, id])
            .catch(err => { return { 'success': false, message: `Recovery email sent, database failure.` } })
        return { 'success': true, message: `Recovery email sent to ${message.to}. Click the link to reset your password.` }
    }

}

(async function () {
    try {
        if (typeof User.connection === 'undefined') {
            // console.log('model/user anonymous')
            await User.dbConnect()
        }
    } catch (e) {
        // console.log('model/user anonymous error:', e)
    }
})()