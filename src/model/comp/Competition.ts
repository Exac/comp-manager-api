import { User } from '../user';
import Registration from './Registration';
import Protocol from './Protocol';
import Division from './Division';


export default class Competition {

    public readonly competition_id: number
    public creator: User
    public divisions: Division[]
    public registrations: Registration[]
    public protocol: Protocol
    public name: string
    public join_token: string
    public creation_time: Date
    public start_date: Date
    public end_date: Date
    public location: string

    /**
     * Competition is the main parent component of the system. They are stored in the database in
     * `chollima.competitions`. 
     * 
     * @param competition_id The competition's unique identifying number. `SERIAL NOT NULL` in db.
     * @example let c = new Competition(42)
     * c.competition // 42
     */
    constructor(
        competition_id?: number,
        creator?: User,
        divisions?: Division[],
        registrations?: Registration[],
        protocol?: Protocol,
        name?: string,
        join_token?: string,
        creation_time?: Date,
        start_date?: Date,
        end_date?: Date,
        location?: string) {

        this.competition_id = competition_id ? competition_id : 0;
        this.creator = creator ? creator : new User(0)
        this.divisions = divisions ? divisions : []
        this.registrations = registrations ? registrations : []
        this.protocol = protocol ? protocol : new Protocol()
        this.name = name ? name : ''
        this.join_token = join_token ? join_token : ''
        this.creation_time = creation_time ? creation_time : new Date()
        this.start_date = start_date ? start_date : new Date()
        this.end_date = end_date ? end_date : new Date()
        this.location = location ? location : ''
    }

}
