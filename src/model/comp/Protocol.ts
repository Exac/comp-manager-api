
export default class Protocol {
    public protocol_id: number
    public protocol: string
    public is_custom: boolean
    public json: object

    public constructor(
        protocol_id?: number,
        protocol?: string,
        is_custom?: boolean,
        json?: object) {
        this.protocol_id = protocol_id ? protocol_id : 0
        this.protocol = protocol ? protocol : ''
        this.is_custom = is_custom ? is_custom : false
        this.json = json ? json : {}
    }

}