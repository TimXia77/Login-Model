let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require("../server");

var cookieParser = require("cookie-parser");
const cookie = require('cookie');

const dataLayer = require('./../../data.js');

const { expect } = chai;
chai.use(chaiHttp);
app.use(cookieParser());

describe('Login and Register:\n', () => {
    dataLayer.clearData();
    describe('Successful Requests', () => {
        describe('GET /register', () => {
            it('Should render the register-en page (html) successfully', (done) => {
                chai.request(app)
                    .get('/register')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.be.html;
                        done();
                    });
            });
        });
        describe('GET /login', () => {
            it('Should render the login-en page (html) successfully', (done) => {
                chai.request(app)
                    .get('/login')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.be.html;
                        done();
                    });
            });
        });
        describe('POST /register', () => {
            it('Successfully registered account (should return 200)', (done) => {
                chai.request(app)
                    .post('/register')
                    .send({ email1: 'timxia@gmail.com', username1: 'TimXia77', password1: '123abcDEF' })
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.be.html;
                        done();
                    });
            });
        });
        describe('POST /login', () => {
            it('Successfully logged in to account (should return 200)', (done) => {
                chai
                    .request(app)
                    .post('/login')
                    .send({ username1: 'TimXia77', password1: '123abcDEF' })
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.be.html;
                        // // Check the token cookie here
                        // console.log('Token Cookie:', tokenCookie);
                        done();
                    });
            });
        });
        describe('POST /logout', () => {
            it('Successfully logged out of account (should return 200)', (done) => {
                chai
                    .request(app)
                    .post('/logout')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.redirect;
                        done();
                    });
            });
        });
        describe('POST /logout', () => {
            it('Successfully logged out of account (should return 200)', (done) => {
                chai
                    .request(app)
                    .post('/logout')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.redirect;
                        done();
                    });
            });
        });
    });
    describe('Unsuccessful Requests', () => {
        describe('POST /register', () => {
            it('Tried to register with taken username (should return 401)', (done) => {
                chai
                    .request(app)
                    .post('/register')
                    .send({ email1: 'timxiaa@gmail.com', username1: 'TimXia77', password1: '123abcDEF' })
                    .end((err, res) => {
                        expect(res).to.have.status(401); 
                        //expect(res.text).to.include(... checking for ejs msg
                        done();
                    });
            });
            it('Tried to register with taken email (should return 401)', (done) => {
                chai
                    .request(app)
                    .post('/register')
                    .send({ email1: 'timxia@gmail.com', username1: 'TimXia777', password1: '123abcDEF' })
                    .end((err, res) => {
                        expect(res).to.have.status(401); 
                        //expect(res.text).to.include(... checking for ejs msg
                        done();
                    });
            });
            it('Tried to register with taken username and taken email (should return 401)', (done) => {
                chai
                    .request(app)
                    .post('/register')
                    .send({ email1: 'timxia@gmail.com', username1: 'TimXia77', password1: '123abcDEF' })
                    .end((err, res) => {
                        expect(res).to.have.status(401); 
                        //expect(res.text).to.include(... checking for ejs msg
                        done();
                    });
            });
        });
        describe('POST /login', () => {
            it('Tried to register with invalid username (should return 401)', (done) => {
                chai
                    .request(app)
                    .post('/login')
                    .send({username1: 'TimXia123', password1: '123abcDEF' })
                    .end((err, res) => {
                        expect(res).to.have.status(401); 
                        //expect(res.text).to.include(... checking for ejs msg
                        done();
                    });
            });
            it('Tried to register with invalid password (should return 401)', (done) => {
                chai
                    .request(app)
                    .post('/login')
                    .send({username1: 'TimXia77', password1: 'badPassword' })
                    .end((err, res) => {
                        expect(res).to.have.status(401); 
                        //expect(res.text).to.include(... checking for ejs msg
                        done();
                    });
            });
        });
    });
});