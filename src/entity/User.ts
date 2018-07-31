import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";

@Entity({name: 'users'})
export default class User {

    @PrimaryGeneratedColumn()
    public user_id: number

    @Column()
    public alias: string
    
    @Column()
    public email: string

    @Column()
    public password: string
   
    @Column()
    public recovery: string
    
    @Column()
    public recovery_expire: Date
}
