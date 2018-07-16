import Race from './Race';
import Skater from './Skater';


export default class Record {
    public record_id: number
    public time: number
    public place: number
    public start_line_position: number
    public advance_as_time: number
    public advance_as_place: number
    public is_dnf: boolean
    public is_dq: boolean
    public is_dns: boolean
    public is_wdr: boolean
    public is_rs: boolean
    public is_mt: boolean
    public is_yellow_card: boolean
    public is_red_card: boolean

    constructor(
        record_id?: number,
        time?: number,
        place?: number,
        start_line_position?: number,
        advance_as_time?: number,
        advance_as_place?: number,
        is_dnf?: boolean,
        is_dq?: boolean,
        is_dns?: boolean,
        is_wdr?: boolean,
        is_rs?: boolean,
        is_mt?: boolean,
        is_yellow_card?: boolean,
        is_red_card?: boolean
    ) {
        this.record_id = record_id ? record_id : 0
        this.time = time ? time : 0
        this.place = place ? place : 0
        this.start_line_position = start_line_position ? start_line_position : 0
        this.advance_as_time = advance_as_time ? advance_as_time : 0
        this.advance_as_place = advance_as_place ? advance_as_place : 0
        this.is_dnf = is_dnf ? is_dnf : false
        this.is_dq = is_dq ? is_dq : false
        this.is_dns = is_dns ? is_dns : false
        this.is_wdr = is_wdr ? is_wdr : false
        this.is_rs = is_rs ? is_rs : false
        this.is_mt = is_mt ? is_mt : false
        this.is_yellow_card = is_yellow_card ? is_yellow_card : false
        this.is_red_card = is_red_card ? is_red_card : false
    }

}