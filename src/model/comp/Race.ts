import Record from './Record'

export default class Race {

    public race_id: number = 0
    public records: Record[] = []
    public distance_name: string = ''
    public distance: number = 0
    public track: string = ''
    public type: string = ''
    public x_race: number = 0
    public y_round: number = 0
    public z_group: number = 0

    constructor(
        race_id?: number,
        records?: Record[],
        distance_name?: string,
        distance?: number,
        track?: string,
        type?: string,
        x_race?: number,
        y_round?: number,
        z_group?: number,
    ) {
        this.race_id = race_id ? race_id : 0
        this.records = records ? records : []
        this.distance_name = distance_name ? distance_name : ''
        this.distance = distance ? distance : 0
        this.track = track ? track : ''
        this.type = type ? type : ''
        this.x_race = x_race ? x_race : 0
        this.y_round = y_round ? y_round : 0
        this.z_group = z_group ? z_group : 0
    }

}