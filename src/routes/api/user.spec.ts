import { expect, should } from 'chai'
import * as sinon from 'sinon'
import * as supertest from 'supertest'
import { app } from '../..'

describe('ROUTES /api/user/', () => {

    describe('POST /', () => {
        it('return 404 when empty inputs supplied', (done) => {
            let spy = sinon.spy(app)
            supertest(spy)
                .get('/api/user/')
                .expect(404)
                .end((err, res) => {
                    if (err) return done(err)
                    done()
                })
        })
    })

    describe('GET /alias/:userid', () => {
        it('return okay', (done) => {
            let spy = sinon.spy(app)
            supertest(spy)
                .get('/api/user/alias/1')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err)
                    expect(res.body).to.include.keys('alias')
                    expect(typeof res.body.alias === 'string').to.be.true
                    done()
                })
        })
    })

    describe('GET /email/:userid', () => {
        it('return okay', (done) => {
            let spy = sinon.spy(app)
            supertest(spy)
                .get('/api/user/email/1')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err)
                    expect(res.body).to.include.keys('email')
                    expect(typeof res.body.email === 'string').to.be.true
                    done()
                })
        })
    })

    describe('GET /email/:email/exists', () => {
        it('return okay', (done) => {
            let spy = sinon.spy(app)
            supertest(spy)
                .get('/api/user/email/email@example.com/exists')
                .expect(200)
                .end((err, res) => {
                    expect(res.body).to.be.a('boolean')
                    if (err) return done(err)
                    done()
                })
        })
    })

    describe('PUT /password/', () => {
        it('return 404 when no password supplied', (done) => {
            let spy = sinon.spy(app)
            supertest(spy)
                .get('/api/user/password')
                .expect(404)
                .end((err, res) => {
                    if (err) return done(err)
                    expect(res.body).to.be.empty
                    done()
                })
        })
    })

    describe('GET /logout/', () => {
        it('return okay', (done) => {
            let spy = sinon.spy(app)
            supertest(spy)
                .get('/api/user/logout')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err)
                    expect(res.body.success).to.be.a('boolean')
                    expect(res.body.success).to.be.true
                    done()
                })
        })
    })

    describe('POST /login/', () => {
        it('return okay', (done) => {
            let spy = sinon.spy(app)
            supertest(spy)
                .post('/api/user/login')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err)
                    expect(res.body.success).to.exist
                    expect(res.body.success).to.be.a('boolean')
                    done()
                })
        })
    })

    describe('POST /login/', () => {
        it('return okay', (done) => {
            let spy = sinon.spy(app)
            supertest(spy)
                .post('/api/user/login')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err)
                    done()
                })
        })
    })

    describe('POST /forgot/', () => {
        it('return okay', (done) => {
            let spy = sinon.spy(app)
            supertest(spy)
                .post('/api/user/forgot')
                .send({'email':'email@example.com'})
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err)
                    expect(res.body.success).to.exist
                    expect(res.body.success).to.be.true
                    done()
                })
        })
    })

    



})
