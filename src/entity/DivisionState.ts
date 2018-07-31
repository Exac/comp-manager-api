import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
// import Race from './Race';
// import Skater from './Skater';

@Entity({ name: 'divisions_states' })
export default class DivisionState {

    @PrimaryGeneratedColumn()
    private division_state_id: number

    @Column()
    private competition_id: number

    @Column({ type: 'varchar', nullable: true })
    private state: string

}
