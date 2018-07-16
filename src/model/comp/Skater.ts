import { Sex } from './Sex.enum';


export default class Skater {

    public skater_id: number
    public ssc_id: number
    public isu_id: number
    public birth_date: Date
    public sex: Sex
    public first_name: string
    public last_name: string
    public country: string
    public state: string
    public city: string
    public club: string
    public address: string

    constructor(
        skater_id?: number,
        ssc_id?: number,
        isu_id?: number,
        birth_date?: Date,
        sex?: Sex,
        first_name?: string,
        last_name?: string,
        country?: string,
        state?: string,
        city?: string,
        club?: string,
        address?: string,
    ) {
        this.skater_id = skater_id ? skater_id : 0
        this.ssc_id = ssc_id ? ssc_id : 0
        this.isu_id = isu_id ? isu_id : 0
        this.birth_date = birth_date ? birth_date : new Date()
        this.sex = sex ? sex : Sex.m
        this.first_name = first_name ? first_name : ''
        this.last_name = last_name ? last_name : ''
        this.country = country ? country : ''
        this.state = state ? state : ''
        this.city = city ? city : ''
        this.club = club ? club : ''
        this.address = address ? address : ''
    }

}