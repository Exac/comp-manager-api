import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";

@Entity({name: 'divisions'})
export default class Division {

    @PrimaryGeneratedColumn()
    public division_id: number

    @Column()
    public current_state: string
    
    @Column()
    public name: string
}
