/**
 * User interface
 * User also has password, recovery hash, etc in the database.
 */
export interface IUser {
    id: number;
    alias: string;
    email: string;
}

export default IUser