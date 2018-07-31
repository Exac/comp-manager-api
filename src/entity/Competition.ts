import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import User from './User';
import Registration from './Registration';
import Protocol from './Protocol';
import Division from './Division';

@Entity({ name: 'competitions' })
export default class Competition {

    @PrimaryGeneratedColumn()
    public readonly competition_id!: number

    @Column()
    public creator!: User

    @Column()
    public divisions!: Division[]

    @Column()
    public registrations!: Registration[]

    @Column()
    public protocol!: Protocol

    @Column({ type: 'varchar', length: 100 })
    public name!: string

    @Column()
    public join_token!: string

    @Column({nullable: true})
    public creation_time!: Date

    @Column()
    public start_date!: Date

    @Column()
    public end_date!: Date

    @Column()
    public location!: string

}
