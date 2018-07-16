import { expect, should } from 'chai'
import { User } from './user'
const rewire = require('rewire')

let U = rewire('./user')

let encoder = U.__get__('User.encoder')

describe("User", () => {
    describe("#id, #email, #alias", () => {
        it('initialized to defaults', () => {
            let user = new User();
            expect(user.id).to.equal(0)
            expect(user.email).to.equal('')
            expect(user.alias).to.equal('')
        })
        it('can be instansiated', () => {
            let user = new User(100, 'email@example.com', 'Thomas');
            expect(user.id).to.equal(100)
            expect(user.email).to.equal('email@example.com')
            expect(user.alias).to.equal('Thomas')
        })
    })

    describe('.encoder', () => {
        it('is an object', () => {
            expect(encoder).to.be.a('object')
        })
    })

    describe('#getPassword()', () => {
        it(`rejects an error if no user exists in the database`, async () => {
            let u = new User(9999999999, 'email@example.com', 'Thomas')
            let result = await u.getPassword()
                .then(r => { expect(r).to.be.null })
                .catch(e => {
                    expect(e).to.equal(`No password set for user with id: ${u.id}.`)
                })
        })
        it(`gets the 60 character password`, async () => {
            let u = new User(1, 'email@example.com', 'Thomas')
            let result = await u.getPassword()
                .then(r => {
                    expect(r.length).to.equal(60)
                    return r
                })
                .catch(e => {
                    expect(e).to.equal(`No password set for user with id: ${u.id}.`)
                })
        })
        it(`only has bcrypt hashes instead of plaintext passwords`, async () => {
            let u = new User(1, 'email@example.com', 'Thomas')
            let result = await u.getPassword()
                .then(r => {
                    expect(r.charAt(0)).to.equal('$')
                    expect(r.charAt(3)).to.equal('$')
                    expect(r.charAt(6)).to.equal('$')
                    return r
                })
                .catch(e => {
                    expect(e).to.equal(`No password set for user with id: ${u.id}.`)
                })
        })
    })

    describe('#getRecovery()', () => {
        it(`rejects an error if no user exists in the database`, async () => {
            let u = new User(9999999999, 'email@example.com', 'Thomas')
            let result = await u.getRecovery()
                .then(r => { expect(r).to.be.null })
                .catch(e => {
                    expect(e).to.equal(`No recovery set for user with id: ${u.id}.`)
                })
        })
        it(`gets the 60 character recovery hash`, async () => {
            let u = new User(4, 'email@example.com', 'Thomas')
            let result = await u.getRecovery()
                .then(r => {
                    expect(r.length).to.equal(60)
                    return r
                })
                .catch(e => {
                    expect(e).to.equal(`No recovery set for user with id: ${u.id}.`)
                })
        })
        it(`only has bcrypt hashes instead of the 128-bit plaintext recovery string`, async () => {
            let u = new User(4, 'email@example.com', 'Thomas')
            let result = await u.getRecovery()
                .then(r => {
                    expect(r.charAt(0)).to.equal('$')
                    expect(r.charAt(3)).to.equal('$')
                    expect(r.charAt(6)).to.equal('$')
                    return r
                })
                .catch(e => {
                    expect(e).to.equal(`No recovery set for user with id: ${u.id}.`)
                })
        })
    })

    describe('#getRecoveryExpire()', () => {
        it(`rejects an error if no user exists in the database`, async () => {
            let u = new User(9999999999, 'email@example.com', 'Thomas')
            let result = await u.getRecoveryExpire()
                .then(r => { expect(r).to.be.null })
                .catch(e => {
                    expect(e).to.equal(`No recovery set for user with id: ${u.id}.`)
                })
        })
        it(`gets a expiration-date from the database`, async () => {
            let u = new User(1, 'email@example.com', 'Thomas')
            let result = await u.getRecoveryExpire()
                .then(r => { expect(r).to.be.a('Date'); return r })
                .catch(e => {
                    expect(e).to.equal(`No recovery set for user with id: ${u.id}.`)
                })
            u.id = 4;
            result = await u.getRecoveryExpire()
                .then(r => { expect(r).to.be.a('Date'); return r })
                .catch(e => {
                    expect(e).to.equal(`No recovery set for user with id: ${u.id}.`)
                })
            u.id = 9999999999
            result = await u.getRecoveryExpire()
                .then(r => { expect(r).to.be.a('Date'); return r })
                .catch(e => {
                    expect(e).to.equal(`No recovery set for user with id: ${u.id}.`)
                })
        })
    })

    describe('#setId(id)', () => {
        it(`is a function`, async () => {
            let u = new User()
            expect(u.setId).to.be.a('function')
        })
        it(`rejects malformed input`, async () => {
            let u = new User()
            await u.setId(-1)
                .then(res => { expect(res).to.be.undefined })
                .catch(err => { expect(err).to.have.string('Invalid') })
        })
    })

    describe('#setAlias(alias)', () => {
        it(`is a function`, async () => {
            let u = new User()
            expect(u.setAlias).to.be.a('function')
        })
        it(`rejects malformed input`, async () => {
            let u = new User()
            await u.setAlias('')
                .then(res => { expect(res).to.be.undefined })
                .catch(err => { expect(err).to.have.string('Invalid') })
            await u.setAlias('Flavius Valerius Aurelius Constantinus Augustus')
                .then(res => { expect(res).to.be.undefined })
                .catch(err => { expect(err).to.have.string('Invalid') })
            await u.setAlias('&#x3D;&#x74;&#x72;&#x75;&#x65;&#x3B;')
                .then(res => { expect(res).to.be.undefined })
                .catch(err => { expect(err).to.have.string('Invalid') })
        })
    })

    describe('#setEmail(email)', () => {
        it(`is a function`, async () => {
            let u = new User()
            expect(u.setEmail).to.be.a('function')
        })
        it(`rejects malformed input`, async () => {
            let u = new User()
            await u.setEmail('')
                .then(res => { expect(res).to.be.undefined })
                .catch(err => { expect(err).to.have.string('Invalid') })
            await u.setEmail('stallman at FSF dot org')
                .then(res => { expect(res).to.be.undefined })
                .catch(err => { expect(err).to.have.string('Invalid') })
            await u.setEmail('நபர்@வலைத்தளம்.இந்தியா')
                .then(res => { expect(res).to.be.undefined })
                .catch(err => { expect(err).to.have.string('Invalid') })
        })
    })

    describe('#setPassword(password)', () => {
        it(`is a function`, async () => {
            let u = new User()
            expect(u.setPassword).to.be.a('function')
        })
    })

    describe('#setRecovery(recovery)', () => {
        it(`is a function`, async () => {
            let u = new User()
            expect(u.setRecovery).to.be.a('function')
        })
    })

    describe('#isValidRecovery(recovery, id?)', () => {
        it(`is a function`, async () => {
            let u = new User()
            expect(u.isValidRecovery).to.be.a('function')
        })
    })

    describe('.set(alias, email, password, id?)', () => {
        it(`is a function`, async () => {
            let u = new User()
            expect(User.set).to.be.a('function')
        })
        it(`doesn't allow a blank user to be created`, async () => {
            await User.set('', '', '')
                .then(res => { expect(res).to.be.false })
                .then(err => { expect(err).to.not.be.null })
        })
    })

    describe(`.get(identifier, password?)`, () => {
        it(`is a function`, async () => {
            expect(User.get).to.be.a('function')
        })
        it(`gets a user`, async () => {
            await User.get(1)
                .then(res => {
                    expect(res).to.not.be.null
                    expect(res).to.have.all.keys('id', 'alias', 'email')
                })
                .catch(err => {
                    expect(err).to.not.be.null
                })
        })
        it(`rejects with a non-existant user`, async () => {
            await User.get(9999999999)
                .then(res => {
                    expect(res).to.not.be.null
                    expect(res).to.have.all.keys('id', 'alias', 'email')
                })
                .catch(err => {
                    expect(err).to.not.be.null
                })
        })
    })

    describe(`.getId(email)`, () => {
        it(`is a function`, async () => {
            expect(User.getId).to.be.a('function')
        })
        it(`returns a user id`, async () => {
            await User.getId('contact@thomasmclennan.ca')
                .then(res => {
                    expect(res).to.not.be.null
                    expect(res).to.be.a('number')
                })
                .catch(err => {
                    expect(err).to.not.be.null
                })
        })
        it(`rejects with a blank input`, async () => {
            await User.getId('')
                .then(res => {
                    expect(res).to.not.be.null
                    expect(res).to.be.a('number')
                })
                .catch(err => {
                    expect(err).to.not.be.null
                })
        })
    })

    describe(`.getAlias(id)`, () => {
        it(`is a function`, async () => {
            expect(User.getAlias).to.be.a('function')
        })
        it(`returns a user alias`, async () => {
            await User.getAlias(1)
                .then(res => {
                    expect(res).to.not.be.null
                    expect(res).to.be.a('number')
                })
                .catch(err => {
                    expect(err).to.not.be.null
                })
        })
        it(`rejects with a non-existant user`, async () => {
            await User.getAlias(9999999999)
                .then(res => {
                    expect(res).to.not.be.null
                    expect(res).to.be.a('number')
                })
                .catch(err => {
                    expect(err).to.not.be.null
                })
        })
    })

    describe(`.getEmail(id)`, () => {
        it(`is a function`, async () => {
            expect(User.getEmail).to.be.a('function')
        })
        it(`returns a user email`, async () => {
            await User.getEmail(1)
                .then(res => {
                    expect(res).to.not.be.null
                    expect(res).to.be.a('number')
                })
                .catch(err => {
                    expect(err).to.not.be.null
                })
        })
        it(`rejects with a non-existant user`, async () => {
            await User.getEmail(9999999999)
                .then(res => {
                    expect(res).to.not.be.null
                    expect(res).to.be.a('number')
                })
                .catch(err => {
                    expect(err).to.not.be.null
                })
        })
    })

    describe(`.existsEmail(email)`, () => {
        it(`is a function`, async () => {
            expect(User.existsEmail).to.be.a('function')
        })
        it(`will find see if an email exists in the database`, async () => {
            await User.existsEmail('contact@thomasmclennan.ca')
                .then(res => {
                    expect(res).to.not.be.null
                    expect(res).to.be.a('boolean')
                })
                .catch(err => {
                    expect(err).to.not.be.null
                })
        })
    })

    describe(`.existsAlias(alias)`, () => {
        it(`is a function`, async () => {
            expect(User.existsAlias).to.be.a('function')
        })
        it(`will find see if an alias exists in the database`, async () => {
            await User.existsAlias('Thomas')
                .then(res => {
                    expect(res).to.not.be.null
                    expect(res).to.be.a('boolean')
                })
                .catch(err => {
                    expect(err).to.not.be.null
                })
        })
    })

    describe(`.isValidLogin(email, password)`, () => {
        it(`is a function`, async () => {
            expect(User.isValidLogin).to.be.a('function')
        })
        it(`will detect a good login`, async () => {
            await User.isValidLogin('x@thomasmclennan.ca', 'x')
                .then(res => {
                    expect(res).to.not.be.null
                    expect(res).to.be.a('boolean')
                })
                .catch(err => {
                    expect(err).to.not.be.null
                })
        })
        it(`will report invalid input`, async () => {
            await User.isValidLogin('richard at fsf dot org', '4chopsticks')
                .then(res => { })
                .catch(err => {
                    expect(err).to.have.string('Invalid')
                })
        })
    })

    describe(`.authenticate(email, password)`, () => {
        it(`is a function`, async () => {
            expect(User.authenticate).to.be.a('function')
        })
        it(`will detect a good login`, async () => {
            await User.authenticate('x@thomasmclennan.ca', 'x')
                .then(res => {
                    expect(res).to.not.be.null
                    expect(res).to.be.a('boolean')
                })
                .catch(err => {
                    expect(err).to.not.be.null
                })
        })
        it(`will report invalid input`, async () => {
            await User.authenticate('richard at fsf dot org', '4chopsticks')
                .then(res => { })
                .catch(err => {
                    expect(err).to.have.string('Invalid')
                })
        })
    })

    describe(`.forgot(email, message, transporter)`, () => {
        it(`is a function`, async () => {
            expect(User.authenticate).to.be.a('function')
        })
    })

})
