import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import * as Entities from 'html-entities';
import { AllHtmlEntities } from 'html-entities';
import db from './db'

export class User implements IUser {
    public id: number;
    public alias: string;
    public email: string;

    private static encoder: AllHtmlEntities = new Entities.AllHtmlEntities();

    constructor() {

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
        let query = 'SELECT id,password FROM users where user_id = $1'
        await db.one(query, [this.id])
            .then(row => {
                return <string>row.password;
            })
            .catch(err => {
                return Promise.reject(`No password set for user with id: ${this.id}`)
            })
    }

    public async getRecovery(): Promise<string> {
        if (!User.validateId(this.id)) { return Promise.reject(`Invalid user id: ${this.id}`) }
        let query = 'SELECT recovery FROM users where user_id = $1'
        await db.one(query, [this.id])
            .then(row => {
                return <string>row.recovery;
            })
            .catch(err => {
                return Promise.reject(`No recovery set for user with id: ${this.id}`)
            })
    }

    public async getRecoveryExpire(): Promise<Date> {
        if (!User.validateId(this.id)) { return Promise.reject(`Invalid user id: ${this.id}`) }
        let recoveryExpire: Date;
        let query = 'SELECT recovery_expire FROM users where user_id = $1'
        await db.one(query, [this.id])
            .then(row => {
                if (typeof row.recovery_expire === 'undefined') {
                    return Promise.reject(`No recovery_expire set for user id:${this.id}`)
                }
                recoveryExpire = new Date(row.recovery_expire)
            })
            .catch(err => {
                return Promise.reject(`Couldn't connect to database.`)
            })
        return recoveryExpire
    }

    public async setId(id?: number): Promise<boolean> {
        if (!User.validateId(id)) { return Promise.reject(`Invalid user id: ${id}`) }
        if (!User.validateId(this.id)) { return Promise.reject(`Invalid user id on this.user: ${id}`) }
        // check if id already exists in database
        let query = "SELECT user_id FROM users WHERE user_id = $1";
        await db.any(query, id)
            .then(rows => {
                if (rows.length > 0) {
                    return Promise.reject(`A user already has id: ${id}`)
                }
            })
            .catch(err => {
                return Promise.reject(`Couldn't connect to database.`)
            })
        // change id in database
        query = 'UPDATE users SET user_id = $1 WHERE user_id = $2';
        await db.none(query, [id, this.id])
            .then(res => {
                // update `this`
                this.id = id
            })
            .catch(err => { return Promise.reject(`Couldn't connect to database.`) })
        return Promise.resolve(true)
    }

    public async setAlias(alias: string): Promise<boolean> {
        if (!User.validateAlias(alias)) { return Promise.reject(`Invalid user alias: ${alias}`) }
        if (!User.validateId(this.id)) { return Promise.reject(`Invalid user id on this.user: ${this.alias}`) }
        // check if alias already exists in database
        let query = "SELECT user_id, alias FROM users WHERE alias = $1";
        await db.any(query, alias)
            .then(rows => {
                if (rows.length > 0) {
                    return Promise.reject(`A user already has alias: ${alias}`)
                }
            })
            .catch(err => {
                return Promise.reject(`Couldn't connect to database.`)
            })
        // change alias in database
        query = 'UPDATE users SET alias = $1 WHERE user_id = $2';
        await db.none(query, [alias, this.id])
            .then(res => {
                // update `this`
                this.alias = alias
                return Promise.resolve(true)
            })
            .catch(err => { return Promise.reject(`Couldn't connect to database.`) })
    }

    public async setEmail(email: string): Promise<boolean> {
        if (!User.validateEmail(email)) { return Promise.reject(`Invalid user email: ${email}`) }
        if (!User.validateId(this.id)) { return Promise.reject(`Invalid user id on this.user: ${this.email}`) }
        // check if email already exists in database
        let query = "SELECT user_id, email FROM users WHERE email = $1";
        await db.any(query, email)
            .then(rows => {
                if (rows.length > 0) { // TODO: this will never be called? it'll respond with user_id=null MAYBE??
                    return Promise.reject(`A user already has email: ${email}`)
                }
            })
            .catch(err => {
                return Promise.reject(`Couldn't connect to database.`)
            })
        // change email in database
        query = 'UPDATE users SET email = $1 WHERE user_id = $2';
        await db.none(query, [email, this.id])
            .then(res => {
                // update `this`
                this.email = email
                return Promise.resolve(true)
            })
            .catch(err => { return Promise.reject(`Couldn't connect to database.`) })
    }

    public async setPassword(password: string): Promise<boolean> {
        if (!User.validatePassword(password)) { return Promise.reject(`Invalid user password: ${'*'.repeat(password.length)}}`) }
        // generate salt & hash
        let salt = bcrypt.genSaltSync(4); console.log('salt', salt)
        let hash = await bcrypt.hash(password, salt)
            .catch((err) => { return Promise.reject(`Unable to hash password.`) });
        // update password in database
        let query = 'UPDATE users SET password = $1 WHERE user_id = $2';
        await db.none(query, [hash, this.id])
            .then(res => { })
            .catch(err => {
                return Promise.reject(`Couldn't connect to database. ${err.message}`)
            })
        return Promise.resolve(true)
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
        let query = 'UPDATE users SET recovery = $1, recovery_expire = $2 WHERE user_id = $3'
        await db.none(query, [_hash, expirydate, this.id])
            .catch(err => { return Promise.reject(`Couldn't connect to database.`) })
        return Promise.resolve(true)
    }

    public async isValidRecovery(recovery: string, id: number): Promise<boolean> {
        if (typeof recovery === 'undefined' || recovery === '') { return Promise.reject(`Invalid recovery: ${recovery}`) }
        let query = "SELECT recovery, recovery_expire FROM users where user_id = $1"
        await db.one(query, [id])
            .then((row: any) => {
                console.log('iVR() res:', row, row[0])
                if (row.recovery === null || row.recovery_expire === null) {
                    return Promise.reject(`No recovery key set for user with user_id: ${id}`)
                }
                // check if hash matches
                if (!bcrypt.compareSync(recovery, row.recovery)) {
                    return Promise.reject(`Recovery key validation failed.`)
                }
                // check if recovery code has expired
                let expiry = new Date(row.recover_expiry)
                let now = new Date(Date.now());
                if (expiry < now) {
                    return Promise.reject(`Recovery key expired`)
                }
            })
            .catch((err) => { return Promise.reject(err) });
        return Promise.resolve(true);
    }

    public static async set(alias: string, email: string, password: string, id?: number): Promise<boolean> {
        // validate input format
        if (typeof id !== 'undefined' && !User.validateId(id)) { return Promise.reject(`Invalid id: ${id}`); }
        if (!User.validateAlias(alias)) { return Promise.reject(`Invalid alias: ${alias}`); }
        if (!User.validateEmail(email)) { return Promise.reject(`Invalid email: ${email}`); }
        if (!User.validatePassword(password)) { return Promise.reject(`Invalid password: ${password}`); }
        // check uniqness of keys
        let query: string = (typeof id !== 'undefined')
            ? "SELECT * FROM users WHERE user_id = $1 OR alias = $2 OR email = $3"
            : "SELECT * FROM users WHERE alias = $1 OR email = $2";
        let params: any[] = (typeof id !== 'undefined')
            ? [id, alias, email]
            : [alias, email];
        await db.oneOrNone(query, params)
            .then(res => {
                // user already exists in db, we won't be able to set the supplied user
                if (res) { return Promise.reject(`Account alias and email must be unique.`) }
            })
            .catch(err => { return Promise.reject(`Couldn't connect to database. ${err}`) })
        // create password hash & salt
        let salt: string | void = bcrypt.genSaltSync(4);
        let hash: string | void = await bcrypt.hash(password, salt).catch((e) => { });
        // create account
        query = (typeof id !== 'undefined')
            ? "INSERT INTO users (user_id, email, alias, password) VALUES($1, $2, $3, $4)"
            : "INSERT INTO users (email, alias, password) VALUES($1, $2, $3)";
        let _params: any[] = (typeof id !== 'undefined')
            ? [id, email, alias, hash]
            : [email, alias, hash];
            console.log(query, _params)
        await db.none(query, _params)
            .catch(error => { return Promise.reject(`Couldn't connect to database. ${error}`) })
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
        let _password: string;
        // Users have three keys: id, alias, or email. See which one is used.
        key = typeof identifier === 'number' ? 'user_id' : identifier.includes('@') ? 'email' : 'alias';
        query = `SELECT user_id, alias, email, password FROM users where ${key} = $1 LIMIT 1`
        await db.oneOrNone(query, params)
            .then((row) => {
                if (!row) {
                    return Promise.reject(`User (identifier:${identifier}) does not exist.`)
                }
                u.id = row.user_id;
                u.alias = row.alias;
                u.email = row.email;
                _password = row.password;
            })
            .catch(err => {
                return Promise.reject(`${err}`)
            })
        // err if password is incorrect
        if (password != null) {
            let valid = bcrypt.compareSync(password, _password)
            return valid ? Promise.resolve(u) : Promise.reject(false)
        }

        return u;
    }

    public static async getId(email: string): Promise<number> {
        // ensure email is valid
        if (!User.validateEmail(email)) {
            return Promise.reject('Invalid email');
        }
        // find id in database
        let query = 'SELECT user_id FROM users WHERE email = $1 LIMIT 1';
        let id: number;
        return await db.oneOrNone(query, email)
            .then(row => {
                // reject if results empty
                return row ? row : Promise.reject(`User (email:${email}) does not exist.`)
            })
            .then(row => {
                return parseInt(row.user_id)
            })
            .catch(e => { return Promise.reject(`${e}`) })
    }

    public static async getAlias(id: number): Promise<string> {
        // ensure user_id is valid
        if (!User.validateId(id)) {
            return Promise.reject('Invalid id');
        }
        let query = 'SELECT alias FROM users WHERE user_id = $1 LIMIT 1'
        return await db.oneOrNone(query, [id])
            .then(row => {
                if (!row) { return Promise.reject(`User (id:${id}) does not exist.`) }
                return row.alias
            })
            .catch((e) => { return Promise.reject(`${e}`); })
    }

    public static async getEmail(id: number): Promise<string> {
        if (!User.validateId(id)) {
            return Promise.reject('Invalid id');
        }
        let query = 'SELECT email FROM users WHERE user_id = $1 LIMIT 1'
        return await db.oneOrNone(query, [id])
            .then(row => {
                if (!row) { return Promise.reject(`User (id:${id}) does not exist.`) }
                return row.email
            })
            .catch((e) => { return Promise.reject(`${e}`); })
    }

    public static async existsEmail(email: string): Promise<boolean> {
        let query = 'SELECT user_id FROM users WHERE email = $1 LIMIT 1'
        return await db.oneOrNone(query, [email])
            .then(row => {
                console.log(row)
                return row
            })
            .then(row => { return row ? true : false })
            .catch((e) => { return Promise.reject(`Couldn't connect to database.`); })
    }

    public static async existsAlias(alias: string): Promise<boolean> {
        let query = 'SELECT user_id FROM users WHERE alias = $1 LIMIT 1'
        return await db.oneOrNone(query, [alias])
            .then(row => { return row ? true : false })
            .catch((e) => { return Promise.reject(`Couldn't connect to database.`); })
    }

    /**
     * Check if `email` and `password` match a user. Returns `boolean`.
     * 
     * @param email 
     * @param password 
     */
    public static async isValidLogin(email: string, password: string): Promise<boolean> {
        // validation
        if (!User.validateEmail(email)) {
            return Promise.reject('Invalid email.')
        }
        if (!User.validatePassword(password)) {
            return Promise.reject('Invalid password.')
        }
        // find user in database by email
        let query = 'SELECT password FROM users WHERE email = $1 LIMIT 1';

        return await db.oneOrNone(query, [email])
            .then(row => {
                // reject if no match in database
                return row ? row : Promise.reject(false)
            })
            .then(row => {
                // validate password against user's stored password hash
                return bcrypt.compareSync(password, row.password)
            })
            .catch((e) => { return Promise.reject(e); })

    }

    /**
    * Check if `email` and `password` match a user. Returns `{success:boolean, user:User}`.
    * 
    * @param email 
    * @param password 
    */
    public static async authenticate(email: string, password: string): Promise<{ 'success': boolean, 'user'?: IUser }> {
        // validation
        if (!User.validateEmail(email)) {
            return Promise.reject('Invalid email.')
        }
        if (!User.validatePassword(password)) {
            return Promise.reject('Invalid password.')
        }
        // find user in database by email
        let query = 'SELECT user_id, email, alias, password FROM users WHERE email = $1 LIMIT 1';
        return await db.one(query, [email])
            .then(async row => {
                // validate password against user's stored password hash
                let valid: boolean = await bcrypt.compare(password, row.password)
                    .catch(e => { return Promise.reject('bcrypt error'); });
                if (valid) {
                    return Promise.resolve({ 'success': true, 'user': { 'id': row.user_id, 'alias': row.alias, 'email': row.email } })
                } else {
                    return Promise.reject('Invalid username or password');
                }
            })
            .catch((e) => {
                // reject if no match in database
                return Promise.reject('No user with that email');
            })
    }

    private static validateId(id: number): boolean {
        if (typeof id === 'undefined') { return false }
        if (id < 1) { return false; }
        return true; // all validation passed
    }

    private static validateAlias(alias: string): boolean {
        if (typeof alias === 'undefined') { return false }
        if (alias.length < 1) { return false; }
        if (alias.length > 18) { return false; }
        let diff = User.encoder.encode(alias); // ensure no HTML entities in alias
        if (alias !== diff) { return false; }
        return true; // all validation passed
    }

    private static validateEmail(email: string): boolean {
        if (typeof email === 'undefined') { return false }
        if (!RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/g).test(email)) {
            return false;
        }
        if (email.length < 5) { return false; }
        if (email.length > 255) { return false; }
        return true; // all validation passed
    }

    private static validatePassword(password: string): boolean {
        if (typeof password === 'undefined') { return false }
        if (password.length < 1) { return false; }
        // bcrypt only uses first 72 charcters of password, but no reason to limit it
        return true; // all validation passed
    }

    private static validatePasswordHash(hash: string): boolean {
        if (typeof hash === 'undefined') { return false }
        if (hash.length < 60 || hash.length > 60) {
            return false;
        }
        return true;
    }

    private static validatePasswordSalt(salt: string): boolean {
        if (typeof salt === 'undefined') { return false }
        if (salt.length < 29 || salt.length > 29) {
            return false;
        }
        return true;
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
        await db.none('UPDATE users SET recovery = $1, recovery_expire = $2 WHERE user_id = $3', [_hash, expirydate, id])
            .catch(err => { return { 'success': false, message: `Recovery email sent, database failure. ${err}` } })
        return { 'success': true, message: `Recovery email sent to ${message.to}. Click the link to reset your password.` }
    }

}
