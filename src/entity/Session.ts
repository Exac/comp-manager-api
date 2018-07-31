import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";

@Entity({name: 'session'})
export default class Session {

    @PrimaryGeneratedColumn()
    public sid: number

    @Column()
    public sess: JSON
    
    @Column()
    public expire: Date

}
