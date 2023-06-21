const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../server");
const supertest = require('supertest');

const cookieParser = require("cookie-parser");

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
                        expect(res.text).to.include('<h1 class="mrgn-bttm-lg">Register</h1>');
                        expect(res.text).to.include('(Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters)');
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
                        expect(res.text).to.include('<h1 class="mrgn-bttm-lg">Login</h1>');
                        expect(res.text).to.include('<a href="/register">Register now</a>');
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
                        //console.log(res.text);
                        //expect(res.text).to.include(`<table id="dataTable" class="display" style="width:100%" table class="wb-tables table table-striped table-hover" data-wb-tables='{ "ordering" : false }'>`);
                        //expect(res).to.have.cookie('token'); 
                        //console.log(res)
                        done();
                    });
                // supertest(app) //using npm supertest to read cookies
                //     .post('/register')
                //     .send({ email1: 'timxia@gmail.com', username1: 'TimXia77', password1: '123abcDEF' })
                //     .end((err, res) => {

                //         const cookies = res.headers['set-cookie'];
                //         //console.log('Received cookies (prototype):', cookies);

                //         done();
                //     });
            });
        });
        describe('POST /login', () => {
            it('Successfully logged in to account (should return 200)', (done) => {
                chai.request(app)
                    .post('/login')
                    .send({ username1: 'TimXia77', password1: '123abcDEF' })
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.be.html;
                        const cookies = res.headers['set-cookie']; // Access the "Set-Cookie" header value
                        //console.log('Received cookies:', cookies);
                        // // Check the token cookie here
                        // console.log('Token Cookie:', tokenCookie);
                        //console.log("req.cookies: " + JSON.stringify(req.cookies.token));
                        //console.log(res.header['set-cookie']);
                        done();
                    });
            });
            it('Prototype Login Test (supertest)', (done) => {
                supertest(app) //using npm supertest to read cookies
                    .post('/login')
                    .send({ username1: 'TimXia77', password1: '123abcDEF' })
                    .expect(302)
                    .expect('Set-Cookie', /token=/)
                    .end((err, res) => {
                        if (err) throw err;
                        // const cookies = res.headers['set-cookie'];
                        //console.log('Received cookies (prototype):', cookies);
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
                        expect(res).to.be.html;
                        expect(res.text).to.include('<div class="alert alert-danger"><p>Username already taken</p></div>');
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
                        expect(res).to.be.html;
                        expect(res.text).to.include('<div class="alert alert-danger"><p>Email already taken</p></div>');
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
                        expect(res).to.be.html;
                        expect(res.text).to.include('<div class="alert alert-danger"><p>Username and email invalid</p></div>');
                        done();
                    });
            });
        });
        describe('POST /login', () => {
            it('Tried to register with invalid username (should return 401)', (done) => {
                chai
                    .request(app)
                    .post('/login')
                    .send({ username1: 'TimXia123', password1: '123abcDEF' })
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        expect(res).to.be.html;
                        expect(res.text).to.include('<div class="alert alert-danger"><p>Cannot find username</p></div>');
                        done();
                    });
            });
            it('Tried to register with invalid password (should return 401)', (done) => {
                chai
                    .request(app)
                    .post('/login')
                    .send({ username1: 'TimXia77', password1: 'badPassword' })
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        expect(res).to.be.html;
                        expect(res.text).to.include('<div class="alert alert-danger"><p>Invalid Password</p></div>');
                        done();
                    });
            });
        });
    });
});