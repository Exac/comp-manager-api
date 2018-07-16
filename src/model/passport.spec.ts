import { expect } from 'chai'
const rewire = require('rewire')

let dbModel = rewire('./passport')

let ensureLoggedIn = dbModel.__get__('ensureLoggedIn')

describe("passport middleware", () => {
    describe("ensureLoggedIn()", () => {
        it('is a function', () => {
            expect(ensureLoggedIn).to.be.a('function')
        })
        it('throws errors', () => {
            expect(ensureLoggedIn).to.throw()
        })
    })
})
