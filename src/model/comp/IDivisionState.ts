import Race from './Race';
import Skater from './Skater';

export default interface IDivisionState {

    division_state_id: number
    state: string
    races: Race[]
    cohort: Skater[]

}
