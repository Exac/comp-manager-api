import { expect } from 'chai'
import { db, cn, pgp } from './db'

describe("db - database connection", () => {
    describe("cn - connection options", () => {
        it('is an object', () => {
            expect(cn).to.be.an('object')
        })
        it('has everything required to connect to the database', () => {
            expect(cn).to.have.all.keys('host', 'port', 'database', 'user', 'password')
        })
    })

    describe("pgp - postgres promise initialization options", () => {
        it('exists', () => {
            expect(pgp).to.not.be.null
        })
    })

    describe('db - postgres database library', () => {
        it('exists', () => {
            expect(db).to.not.be.null
        })
        it('has postgresql stream capabilities', () => {
            expect(db).to.have.any.keys('stream', 'proc')
        })
        it('successfully connects as user chollima', async function () {
            // We shouldn't do anything to out production database
            let result = await db.one('SELECT user')
                .then(res => { return res })
                .catch(err => { return false })
            expect(result.user).to.equal('chollima')
            return Promise.resolve()
        })
    })
})
