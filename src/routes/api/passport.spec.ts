import { expect, should } from 'chai'
import * as sinon from 'sinon'
import * as supertest from 'supertest'
import { app } from '../../index'

describe('ROUTES /api/passport/', () => {

    describe('POST /login/', () => {
        it('return redirection headers', (done) => {
            let spy = sinon.spy(app)
            supertest(spy)
                .post('/api/passport/login/')
                .field('email', 'email@example.com')
                .field('password', 'password123123123 ')
                .expect(302)
                .end((err, res) => {
                    expect(res.header.location).to.equal('/api/passport/login/failure')
                    if (err) return done(err)
                    done()
                })
        })
    })

    describe('POST /logout/', () => {
        it('return okay headers', (done) => {
            let spy = sinon.spy(app)
            supertest(app)
                .post('/api/passport/logout/')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err)
                    done()
                })
        })
    })

    describe('POST /isloggedin/', () => {
        it('return okay headers', (done) => {
            let spy = sinon.spy(app)
            supertest(app)
                .post('/api/passport/isloggedin/')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err)
                    done()
                })
        })
    })

    describe('POST /login/failure/', () => {
        it('return okay headers', (done) => {
            let spy = sinon.spy(app)
            supertest(app)
                .get('/api/passport/login/failure/')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err)
                    done()
                })
        })
    })

    describe('POST /login/success/', () => {
        it('return okay headers', (done) => {
            let spy = sinon.spy(app)
            supertest(spy)
                .get('/api/passport/login/success/')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err)
                    expect(typeof res.body.success === 'boolean').to.be.true
                    done()
                })
        })
    })


})
