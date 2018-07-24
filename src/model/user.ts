import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import * as Entities from 'html-entities';
import { AllHtmlEntities } from 'html-entities';
import { IUser } from './Iuser'
import * as passport from 'passport'
import db from './db'

/**
 * User class. Data stored in the `chollima.users` database table.
 */
export class User implements IUser {
    /** User's id number. `user_id` in database. */
    public id: number = 0

    /** User's alias. Name or nickname. 1-18 chars. */
    public alias: string = ''

    /** User's email. */
    public email: string = ''

    private static encoder: AllHtmlEntities = new Entities.AllHtmlEntities();

    /**
     * User class. Data stored in the `chollima.users` database table.
     * Users are akin to competition recorders.
     * 
     * @param id User's id. `this.setId(id)` updates the database.
     * @param email User's email. `this.setEmail(em)` updates the db.
     * @param alias User's alias. `this.setAliasl(al)` updates the db.
     */
    constructor(id?: number, email?: string, alias?: string) {
        // if constructor was passed and valid, assign it 
        // to it's local member, otherwise assign null
        id && User.validateId(id) ? this.id = id : null;
        email && User.validateEmail(email) ? this.email = email : null;
        alias && User.validateAlias(alias) ? this.alias = alias : null;
    }

    /**
     * Gets the id number of this User, or undefined.
     */
    public getId(): number {
        return this.id;
    }

    /**
     * Gets the alias of this User, or undefined.
     */
    public getAlias(): string {
        return this.alias;
    }

    /**
     * Gets the email of this User, or undefined.
     */
    public getEmail(): string {
        return this.email;
    }

    /**
     * Gets the password hash of this User, or rejects the promise.
     */
    public async getPassword(): Promise<string> {
        if (!User.validateId(this.id)) { return Promise.reject(`Invalid user id: ${this.id}`) }
        let query = 'SELECT user_id, password FROM users where user_id = $1'
        let password = await db.one(query, [this.id])
            .then(row => {
                return <string>row.password
            })
            .catch(err => {
                return Promise.reject(`No password set for user with id: ${this.id}.`)
            })
        return Promise.resolve(password)
    }

    /**
     * Gets the 60-char recovery hash of this User, or rejects the promise.
     */
    public async getRecovery(): Promise<string> {
        if (!User.validateId(this.id)) { return Promise.reject(`Invalid user id: ${this.id}`) }
        let query = 'SELECT recovery FROM users where user_id = $1'
        let recovery = await db.one(query, [this.id])
            .then(row => {
                return row.recovery
                    ? row.recovery
                    : Promise.reject(`User (id:${this.id}) has no recovery.`);
            })
            .catch(err => {
                return Promise.reject(`No recovery set for user with id: ${this.id}.`)
            })
        return Promise.resolve(recovery)
    }

    /**
     * Gets the timestamp that the user's recovery hash becomes invalid.
     */
    public async getRecoveryExpire(): Promise<Date> {
        if (!User.validateId(this.id)) {
            return Promise.reject(`Invalid user id: ${this.id}`)
        }
        let query = 'SELECT recovery_expire FROM users where user_id = $1'
        let recoveryExpire = new Date()
        await db.one(query, [this.id])
            .then(res => {
                if (res.recovery_expire === null) {
                    return res
                }
                recoveryExpire = new Date(res.recovery_expire)
                return recoveryExpire
            })
            .catch(err => {
                return Promise.reject(`No recovery set for user with id: ${this.id}.`)
            })
        return recoveryExpire;
    }

    /**
     * Changes the `user_id` of this user in the database, rejects an error if failed.
     * 
     * @param id The new `user_id` of this user.
     */
    public async setId(id: number): Promise<boolean> {
        if (!User.validateId(id)) { return Promise.reject(`Invalid user id: ${id}`) }
        if (!User.validateId(this.id)) {
            return Promise.reject(`Invalid user id on this.user: ${id}`)
        }
        // check if id already exists in database
        let query = "SELECT user_id FROM users WHERE user_id = $1";
        let r = await db.any(query, id)
            .then(rows => {
                if (rows.length > 0) {
                    return `A user already has id: ${id}`
                }
                return
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

    /**
     * Changes the `alias` of this user in the database, rejects an error if failed.
     * 
     * @param alias The new `alias` of this user.
     */
    public async setAlias(alias: string): Promise<boolean> {
        if (!User.validateAlias(alias)) { return Promise.reject(`Invalid user alias: ${alias}`) }
        if (!User.validateId(this.id)) {
            return Promise.reject(`Invalid user id on this.user: ${this.alias}`)
        }
        // check if alias already exists in database
        let query = "SELECT user_id, alias FROM users WHERE alias = $1";
        let aliasExists = await db.any(query, alias)
            .then(rows => {
                return rows.length > 0 ? true : false // A user already has alias
            })
            .catch(err => {
                return false
            })
        if (aliasExists) {
            return Promise.reject(`A user already has alias: ${alias}`)
        }
        // change alias in database
        query = 'UPDATE users SET alias = $1 WHERE user_id = $2';
        await db.none(query, [alias, this.id])
            .then(res => {
                // update `this`
                this.alias = alias
                return Promise.resolve(true)
            })
            .catch(err => { return Promise.reject(`Couldn't connect to database.`) })
        return true
    }

    /**
     * Changes the `email` of this user in the database, rejects if failed.
     * 
     * @param email The new `email` of this user.
     */
    public async setEmail(email: string): Promise<boolean> {
        if (!User.validateEmail(email)) { return Promise.reject(`Invalid user email: ${email}`) }
        if (!User.validateId(this.id)) {
            return Promise.reject(`Invalid user id on this.user: ${this.email}`)
        }
        // check if email already exists in database
        let query = "SELECT user_id, email FROM users WHERE email = $1";
        await db.none(query, email)
            .then()
            .catch(err => {
                return Promise.reject(`A user already has email: ${email}. Error: ${err}`)
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
        return true;
    }

    /**
     * Changes this user's `password` in the database, rejects with an error if failed.
     * 
     * @param password The new `password` for this user.
     */
    public async setPassword(password: string): Promise<boolean> {
        if (!User.validatePassword(password)) {
            return Promise.reject(`Invalid user password: ${'*'.repeat(password.length)}}`)
        }
        // generate salt & hash
        let salt = bcrypt.genSaltSync(4);
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

    /**
     * Changes this user's `recovery` hash in the database, rejects with an error if failed.
     * 
     * @param recovery The `recovery` string to send to a user. It's hash is stored in the db.
     * @example let ok = await myUser.setRecovery()
     *   .then(b=>{return b})
     *   .catch(e=>{return false})
     */
    public async setRecovery(recovery?: string): Promise<boolean> {
        // Only change recovery if a fresh recovery doesn't exist
        let currentExpiry: Date = await this.getRecoveryExpire()
            .then(res => { return new Date(res) })
            .catch(err => { return new Date(Date.now()); }) // set to current date
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

    /**
     * Check a recovery key against the database. True if it matches, reject if not.
     * 
     * @param recovery Recovery string. This is normally 128 characters long.
     * @param id The `user_id` of the user to check.
     */
    public async isValidRecovery(recovery: string, id?: number): Promise<boolean> {
        id = id || this.id;
        if (typeof recovery === 'undefined' || recovery === '') {
            return Promise.reject(`Invalid recovery: ${recovery}`)
        }
        let query = "SELECT recovery, recovery_expire FROM users where user_id = $1"
        await db.one(query, [id])
            .then((row: any) => {
                if (row.recovery === null || row.recovery_expire === null) {
                    return `No recovery key set for user with user_id: ${id}`
                }
                // check if hash matches
                if (!bcrypt.compareSync(recovery, row.recovery)) {
                    return `Recovery key validation failed.`
                }
                // check if recovery code has expired
                let expiry = new Date(row.recover_expiry)
                let now = new Date(Date.now());
                if (expiry < now) {
                    return `Recovery key expired`
                }
                return
            })
            .catch((err) => { return Promise.reject(err) });
        return Promise.resolve(true);
    }

    /**
     * Create a new user in the database.
     * 
     * @param alias Alias is the name of the user, under 18 characters.
     * @param email Email of the user. Must be valid.
     * @param password Password of the user.
     * @param id Optional user_id of the new user.
     */
    public static async set
        (alias: string, email: string, password: string, id?: number): Promise<boolean> {
        // validate input format
        if (typeof id !== 'undefined' && !User.validateId(id)) {
            return false
        }
        if (!User.validateAlias(alias)) { return false }
        if (!User.validateEmail(email)) { return false }
        if (!User.validatePassword(password)) {
            return false
        }
        // check uniqness of keys
        let query: string = (typeof id !== 'undefined')
            ? "SELECT * FROM users WHERE user_id = $1 OR alias = $2 OR email = $3"
            : "SELECT * FROM users WHERE alias = $1 OR email = $2";
        let params: any[] = (typeof id !== 'undefined')
            ? [id, alias, email]
            : [alias, email];
        await db.oneOrNone(query, params)
            .then((res: any) => {
                // user already exists in db, we won't be able to set the supplied user
                if (res) { return `Account alias and email must be unique.` }
                return
            })
            .catch(err => { return `Couldn't connect to database. ${err}` })
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
        await db.none(query, _params)
            .catch(error => { return Promise.reject(`Couldn't connect to database. ${error}`) })
        return true
    }

    /**
     * Gets a user with an identifier and password. 
     * Reject if none.
     * 
     * @param identifier Either user's `user_id`, `alias` or `email`.
     * @param password User's password, required if not logged in.
     */
    public static async get(identifier: number | string, password?: string): Promise<User> {
        // get a non-static user object
        if (typeof identifier === 'undefined') {
            return Promise.reject('Error: User.get(identifier, password?) called, but identifier '
                + 'was undefined ')
        }
        let u: User = new User();
        let query: string;
        let params: any[] = [identifier]
        let key: string;
        let _passwordHash: string = ''
        // Users have three keys: id, alias, or email. See which one is used.
        key = typeof identifier === 'number'
            ? 'user_id' : identifier.includes('@') ? 'email' : 'alias';
        query = `SELECT user_id, alias, email, password FROM users where ${key} = $1 LIMIT 1`
        await db.oneOrNone(query, params)
            .then((row) => {
                if (!row) {
                    return `User (identifier:${identifier}) does not exist.`
                }
                u.id = row.user_id;
                u.alias = row.alias;
                u.email = row.email;
                _passwordHash = row.password;
                return
            })
            .catch(err => {
                return Promise.reject(`${err}`)
            })
        // err if password is incorrect
        if (password != null) {
            let valid = bcrypt.compareSync(password, _passwordHash)
            return valid ? Promise.resolve(u) : Promise.reject(false)
        }
        return u;
    }

    /**
     * Use an email to get a `user_id` from the database. Reject if none.
     * @param email 
     */
    public static async getId(email: string): Promise<number> {
        // ensure email is valid
        if (!User.validateEmail(email)) {
            return Promise.reject('Invalid email');
        }
        // find id in database
        let query = 'SELECT user_id FROM users WHERE email = $1 LIMIT 1';
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

    /**
     * Get `alias` of a user with their `user_id`. Reject if none.
     * @param id 
     */
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

    /**
     * Get `email` of a user with their `user_id`. Reject if none.
     * @param id 
     */
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

    /**
     * Does a user have the provided `email`? Reject if not.
     * @param email 
     */
    public static async existsEmail(email: string): Promise<boolean> {
        let query = 'SELECT user_id FROM users WHERE email = $1 LIMIT 1'
        return await db.oneOrNone(query, [email])
            .then(row => {
                return row
            })
            .then(row => { return row ? true : false })
            .catch((e) => { return Promise.reject(`Couldn't connect to database.`); })
    }

    /**
     * Does a user have the provided `alias`? Reject if not.
     * @param alias 
     */
    public static async existsAlias(alias: string): Promise<boolean> {
        let query = 'SELECT user_id FROM users WHERE alias = $1 LIMIT 1'
        return await db.oneOrNone(query, [alias])
            .then(row => { return row ? true : false })
            .catch((e) => { return Promise.reject(`Couldn't connect to database.`); })
    }

    /**
     * Check if `email` and `password` match a user. Reject if false.
     * 
     * @param email 
     * @param password The user's actual password.
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
    public static async authenticate(email: string, password: string)
        : Promise<{ 'success': boolean, 'user'?: IUser }> {
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
                    return Promise.resolve({
                        'success': true,
                        'user': { 'id': row.user_id, 'alias': row.alias, 'email': row.email }
                    })
                } else {
                    return Promise.reject('Invalid username or password');
                }
            })
            .catch((e) => {
                // reject if no match in database
                return Promise.reject('No user with that email');
            })
    }

    /**
     * Validate against `user.user_id`
     * @param id User's ID. `UNIQUE serial NOT NULL` in database (`int4, default nextVal()`)
     */
    private static validateId(id: number): boolean {
        // null check
        if (typeof id === 'undefined') { return false }
        // floating-point check
        if (id !== Math.floor(id)) { return false }
        // unsigned check
        if (id < 1) { return false; }
        return true; // all validation passed
    }

    /**
     * Validate against `users.alias`
     * @param alias User's alias. `UNIQUE varchar(18) NOT NULL` in database.
     */
    private static validateAlias(alias: string): boolean {
        // null check
        if (typeof alias === 'undefined') { return false }
        // length check
        if (alias.length < 1) { return false; }
        if (alias.length > 18) { return false; }
        // ensure no HTML entities in alias
        let diff = User.encoder.encode(alias);
        if (alias !== diff) { return false; }
        // all validation passed
        return true;
    }

    /**
     * Validate against `users.email`
     * @param email User's email. `UNIQUE varchar(255) NOT NULL` in database.
     */
    private static validateEmail(email: string): boolean {
        // null check
        if (typeof email === 'undefined') { return false }
        // loose format check
        if (!RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/g).test(email)) {
            return false;
        }
        // length check
        if (email.length < 5) { return false; }
        if (email.length > 255) { return false; }
        // all validation passed
        return true;
    }

    /**
     * Validate a user's raw password
     * @param password User's raw password. Hashed in database.
     */
    private static validatePassword(password: string): boolean {
        // null check
        if (typeof password === 'undefined') { return false }
        // length check
        // bcrypt only uses first 72 charcters of password, but no reason to limit it
        if (password.length < 1) { return false; }
        // log to console if it looks like a password hash is accidentally being validated.
        if (password.length > 18) {
            if (password.charAt(0) === '$') {
                if (User.validatePasswordHash(password)) {
                    console.warn('Caution: Users.validatePassword() was probably called with a '
                        + 'bcrypt hash. Did you mean to use Users.validatePasswordHash() ?')
                }
            }
        }
        // all validation passed
        return true;
    }

    /**
     * Validate against `users.password`
     * @param password User's password hash. `varchar(60) NOT NULL` in database.
     */
    private static validatePasswordHash(hash: string): boolean {
        // null check
        if (typeof hash === 'undefined') { return false }
        // length check
        if (hash.length < 60 || hash.length > 60) {
            return false;
        }
        // bcrypt format check
        if (hash.charAt(0) !== '$' && hash.charAt(3) !== '$') { return false }
        return true;
    }

    /**
     * Send user an recovery code.
     * @param email Email that user supplies
     * @param message Email message see: http://nodemailer.com
     * @param transporter Holds details for logging into the email account to send mail.
     */
    public static async forgot(
        email: string,
        message: nodemailer.SendMailOptions,
        transporter: nodemailer.Transporter
    ): Promise<{ 'success': boolean, 'message': string }> {
        // get user id
        let user: User = new User(); // needed for non-static functions
        let id: number = 0
        // Generate a 128-bit recovery key and send to the user. We will hash the string and store 
        // it in the database. When the user clicks the link, we will compare their submitted 
        // recovery key against the recovery key hash in the database.
        let recovery: string = crypto.randomBytes(Math.ceil(128 / 2)).toString('hex').slice(0, 128)
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
            return {
                'success': true,
                message: `An email was not sent to ${message.to} because the server is running `
                    + `in development mode.`
            }
        }
        // send the email
        await transporter.sendMail(message)
            .catch(err => {
                return {
                    'success': false,
                    message: `Error: could not send email to ${message.to}. `
                        + `Perhaps ${message.from} is offline?`
                }
            })
        // hash the recovery key
        let _salt = bcrypt.genSaltSync(4)
        let _hash = await bcrypt.hash(recovery, _salt).catch(err => {
            return { 'success': false, message: `Couldn't hash password.` }
        })
        // These should have already been taken care of in the call to setRecovery...
        // store the recovery key in database
        const expirydate = new Date(Date.now() + 1000 * 60 * 60 * 4);
        await db.none('UPDATE users SET recovery = $1, recovery_expire = $2 WHERE user_id = $3',
            [_hash, expirydate, id])
            .catch(e => {
                return { 'success': false, message: `Recovery email sent, database failure: ${e}` }
            })
        return {
            'success': true,
            'message': `Recovery email sent to ${message.to}. Click the link to reset your password`
        }
    }

    public toString(): { id: number | undefined | null, email: string, alias: string } {
        return {
            'id': this.id ? this.id : null,
            'email': this.email ? this.email : '',
            'alias': this.alias ? this.alias : ''
        }
    }
}
