import Skater from './Skater';


export default class Registration {
    public registration_id: number
    public registered_date: Date
    public skater: Skater

    constructor (
        registration_id?: number,
        skater?: Skater,
        registered_date?: Date
    ) {
        this.registration_id = registration_id ? registration_id : 0
        this.skater = skater ? skater : new Skater(0)
        this.registered_date = registered_date ? registered_date : new Date()
    }
    
}