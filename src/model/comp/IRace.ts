import Record from './Record'

export default interface IRace {

    race_id: number
    records: Record[]
    distance_name: string
    distance: number
    track: string
    type: string
    x_race: number
    y_round: number
    z_group: number

}
