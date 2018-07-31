import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";
// import Skater from './Skater';

@Entity({name:'registration'})
export default class Registration {

    @PrimaryGeneratedColumn()
    public registration_id: number
    
    @Column()
    public registered_date: Date
    
    @Column()
    public skater: any//Skater
    
}
