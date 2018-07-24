import { User } from '../user';
import Registration from './Registration';
import Protocol from './Protocol';
import Division from './Division';

export default interface ICompetition {

    readonly competition_id: number
    creator: User
    divisions: Division[]
    registrations: Registration[]
    protocol: Protocol
    name: string
    join_token: string
    creation_time: Date
    start_date: Date
    end_date: Date
    location: string

}
