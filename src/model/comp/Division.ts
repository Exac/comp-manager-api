

export default class Division {

    public division_id: number
    public current_state: string
    public name: string

    constructor(
        division_id?: number, 
        name?: string,
        current_state?: string, 
    ) {
        this.division_id = division_id ? division_id : 0
        this.name = name ? name : 'division'
        this.current_state = current_state ? current_state : ''
    }

}