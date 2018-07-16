import Race from './Race';
import Skater from './Skater';


export default class DivisionState {

    private division_state_id: number
    private state: string
    private races: Race[]
    private cohort: Skater[]

    constructor(
        division_state_id?: number,
        state?: string,
        races?: Race[],
        cohort?: Skater[]
    ) {
        this.division_state_id = division_state_id ? division_state_id : 0
        this.state = name ? name : ''
        this.races = races ? races : []
        this.cohort = cohort ? cohort : []
    }

}