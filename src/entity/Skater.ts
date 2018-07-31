import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";
import { Sex } from '../Sex.enum'

@Entity({name:'skaters'})
export default class Skater {

    @PrimaryGeneratedColumn()
    public skater_id: number

    @Column()
    public ssc_id: number
    
    @Column()
    public isu_id: number
    
    @Column()
    public birth_date: Date
    
    @Column()
    public sex: Sex
    
    @Column()
    public first_name: string
    
    @Column()
    public last_name: string
    
    @Column()
    public country: string
    
    @Column()
    public state: string
    
    @Column()
    public city: string
    
    @Column()
    public club: string
    
    @Column()
    public address: string

}
