import { Sex } from '../../Sex.enum';

export default interface ISkater {

    skater_id: number
    ssc_id: number
    isu_id: number
    birth_date: Date
    sex: Sex
    first_name: string
    last_name: string
    country: string
    state: string
    city: string
    club: string
    address: string

}
