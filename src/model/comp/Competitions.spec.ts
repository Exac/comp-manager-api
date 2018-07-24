import { expect } from 'chai'
import Competition from './Competition';
import { User } from '../user';
import * as _ from 'lodash'
import Division from './Division';

describe(`Competition`, () => {

    it(`all keys start with lowercase letters in JSON form, no underscores`, () => {
        let c = new Competition(69)
        c.creator = new User(1, 'contact@thomasmclennan.ca', 'Thomas')
        const json = JSON.stringify(c) // { competition_id=69 }
        const result = JSON.parse(json)
        // go through the properties of the competition
        for (let key in result) {
            // check the 1st letter of the property's name
            let is_lowercase = (/[a-z]/.test(key.charAt(0)))
            expect(is_lowercase).to.be.true
        }
    })

    describe(`#constructor( competition_id? )`, () => {
        it("can instansiate with no parameters", () => {
            expect(function () {
                let c = new Competition()
            }).to.not.throw
        })
        it("can instansiate competition_id", () => {
            let c = new Competition(42)
            expect(c.competition_id).to.equal(42)
        })
    })

    describe(`#competition_id`, () => {
        it("is initialized to 0 if not set", () => {
            let c = new Competition();
            expect(c.competition_id).to.equal(0)
        })
    })

    describe(`#Creator`, () => {
        it(`is User 0 without instansiation`, () => {
            let c = new Competition()
            expect(c.creator.id).to.equal(0)
        })
        it("can be instansiated to a value", () => {
            let c = new Competition()
            c.creator = new User(1, 'contact@thomasmclennan.ca', 'Thomas')
            expect(c.creator.id).to.equal(1)
        })
    })

    describe(`#Division`, () => {
        it(`is an empty array without instansiation`, () => {
            let c = new Competition()
            expect(c.divisions).to.be.an('array')
        })
        it(`can be set and retrieved`, () => {
            let c = new Competition()
            let ds = [new Division(100), new Division(200)]
            c.divisions = ds
            expect(c.divisions[0].division_id).to.equal(100)
            expect(c.divisions[1].division_id).to.equal(200)
        })
        it(`can find a Division by name`, () => {
            let c = new Competition()
            c.divisions = [new Division(100, 'foo'), new Division(200, 'bar')]
            const result: any = _.find(c.divisions, ['name', 'foo'])
            expect(result.name).to.equal('foo')
        })
        it(`can find a Division by id`, () => {
            let c = new Competition()
            c.divisions = [new Division(100, 'foo'), new Division(200, 'bar')]
            let result: any = _.find(c.divisions, ['division_id', 200])
            expect(result.division_id).to.equal(200)
        })
    })

})