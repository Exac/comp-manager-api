import { expect, should } from 'chai'
import * as sinon from 'sinon'
import * as supertest from 'supertest'
import { app } from '../..'

describe('ROUTES /login/', () => {

    describe('POST /recovery/', () => {
        it('404 because of Location headers', (done) => {
            let spy = sinon.spy(app)
            supertest(spy)
                .get('/login/recovery')
                .expect(404)
                .end((err, res) => {
                    if (err) return done(err)
                    done()
                })
        })
    })

})
