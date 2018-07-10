import { expect } from 'chai'
import { app } from './index' // TODO: import this with app = reqire('./index')
import * as request from 'request'

describe("App", () => {
    it("Gets created.", () => {
        let result:boolean = (typeof app !== 'undefined')
        expect(result).to.equal(true)
    })
    it('Uses development environment', () => {
        expect(app.locals.settings.env).to.be.equal('development')
    })
    it('Serves', function(done) {
        request('http://localhost:8081' , function(error, response, body) {
            expect(error).to.be.null
            expect(body).to.not.be.null
            done()
        });
    });
})

