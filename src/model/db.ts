import { IMain, IDatabase } from 'pg-promise';
import * as pgPromise from 'pg-promise';

// Connect to postgres and export the database for use

// connection options,
let cn: any = process.env.NODE_ENV !== 'production' ? {
    host: 'localhost',
    port: 5432,
    database: 'chollima',
    user: 'chollima',
    password: 'chollima'
} : {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
}

const pgp: IMain = pgPromise({
    // initialization options
});

/**
 * PostgreSQL Database
 * 
 * @usage `import db from './model/db'`
 * @usage `db.any('SELECT * FROM users WHERE recovery_expire < $1 AND user_id = $2', [new Date(), 1])`
 */
export const db: IDatabase<any> = pgp(cn)

export default db;
