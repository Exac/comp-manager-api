import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";
// import Record from './Record'

@Entity({name:'races'})
export default class Race {

    @PrimaryGeneratedColumn()
    public race_id: number

    @Column()
    public records: any[]//Record[]
    
    @Column()
    public distance_name: string
    
    @Column()
    public distance: number
    
    @Column()
    public track: string
    
    @Column()
    public type: string
    
    @Column()
    public x_race: number
    
    @Column()
    public y_round: number
    
    @Column()
    public z_group: number

}
