import { expect } from 'chai'
import { app } from '.' // TODO: import this with app = reqire('./index')
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
    // it('Serves', function(done) {
    //     request('http://0.0.0.0:8081' , function(error, response, body) {
    //         expect(error).to.be.null
    //         expect(body).to.not.be.null
    //         done()
    //     });
    // });
})

