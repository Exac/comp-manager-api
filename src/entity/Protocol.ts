import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";


@Entity({ name: 'protocols' })
export default class Protocol {

    @PrimaryGeneratedColumn()
    public protocol_id: number

    @Column({ type: 'varchar', nullable: true })
    public protocol: string

    @Column()
    public is_custom: boolean

    @Column({ type: 'varchar', nullable: true })
    public json: string

}
