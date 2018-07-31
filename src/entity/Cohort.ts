import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity({ name: 'cohort' })
export default class Cohort {

    @PrimaryGeneratedColumn()
    public cohort_id: number

    @Column({ type: 'int4' })
    public division_state_id: number

    @Column({ type: 'int4' })
    public skater_id: number
}
