import { expect } from 'chai'
import { app } from '.'
import * as request from 'request'

describe("App", () => {
    it("Gets created.", () => {
        let result:boolean = (typeof app !== 'undefined')
        expect(result).to.equal(true)
    })
    it('Uses correct environment', () => {
        let environment: string = app.locals.settings.env
        let result = environment === 'testing' || environment === 'development'
        expect(result).to.be.true
    })
})

