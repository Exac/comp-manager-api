import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
// import Race from './Race';
// import Skater from './Skater';

@Entity({ name: 'records' })
export default class Record {

    @PrimaryGeneratedColumn()
    public record_id: number

    @Column()
    public race_id: number

    @Column()
    public cohort_id: number

    @Column({ type: 'numeric', precision: 8, scale: 4, nullable: false })
    public time: number

    @Column({ type: 'int2', precision: 5 })
    public place: number

    @Column({ type: 'int2', precision: 5 })
    public start_line_position: number

    @Column({ type: 'numeric', precision: 8, scale: 4, nullable: true })
    public advance_as_time: number

    @Column({ type: 'int2', nullable: true })
    public advance_as_place: number

    @Column({ type: 'boolean', default: false })
    public is_dnf: boolean

    @Column({ type: 'boolean', default: false })
    public is_dq: boolean

    @Column({ type: 'boolean', default: false })
    public is_dns: boolean

    @Column({ type: 'boolean', default: false })
    public is_wdr: boolean

    @Column({ type: 'boolean', default: false })
    public is_rs: boolean

    @Column({ type: 'boolean', default: false })
    public is_mt: boolean

    @Column({ type: 'boolean', default: false })
    public is_yellow_card: boolean

    @Column({ type: 'boolean', default: false })
    public is_red_card: boolean

}
