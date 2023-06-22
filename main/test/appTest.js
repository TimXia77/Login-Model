
//Requires:
const chai = require('chai');
const chaiHttp = require('chai-http');
const supertest = require('supertest'); //limitations with chai-http -> redirects automatically 
const app = require("../server");
const cookieParser = require("cookie-parser");

//Data access layer (to clear login data before testing) 
const dataLayer = require('./../../data.js');

//Middleware
const { expect } = chai;
chai.use(chaiHttp);
app.use(cookieParser());

var loginCookie; //transports cookie string between tests
var redirectUrl; //transports redirected urls between tests


describe('Login and Register:\n', () => {
    dataLayer.deleteUser('TestUsernameTest');
    
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
            it('Successfully registered account (should return 302)', (done) => {
                supertest(app)
                    .post('/register')
                    .send({ email1: 'TestTest@test.test', username1: 'TestUsernameTest', password1: '123abcDEF' })
                    .expect(302)
                    .expect('set-cookie', /token=/)
                    .end((err, res) => {
                        if (err) throw err;
                        redirectUrl = res.headers.location; // for the next test
                        loginCookie = res.headers['set-cookie'];
                        done();
                    });

            });
            it('Checking if /register redirected to /table correctly', (done) => {
                chai.request(app)
                    .get(redirectUrl)
                    .set('Cookie', loginCookie)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.be.html;
                        expect(res.text).to.include(`<table id="dataTable" class="display" style="width:100%" table class="wb-tables table table-striped table-hover" data-wb-tables='{ "ordering" : false }'>`);
                        expect(res.text).to.include(`<button type="button" class="btn btn-default" id="logoutButton">LOGOUT</button>`);
                        done();
                    });
            });
        });
        describe('POST /login', () => {
            it('Successfully logged in to account (should return 302)', (done) => {
                supertest(app)
                    .post('/login')
                    .send({ username1: 'TestUsernameTest', password1: '123abcDEF' })
                    .expect(302)
                    .expect('set-cookie', /token=/)
                    .end((err, res) => {
                        if (err) throw err;
                        redirectUrl = res.headers.location; // for the next test
                        loginCookie = res.headers['set-cookie'];
                        done();
                    });
            });
            it('Checking if /login redirected to /table correctly', (done) => {
                chai.request(app)
                    .get(redirectUrl)
                    .set('Cookie', loginCookie)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.be.html;
                        expect(res.text).to.include(`<table id="dataTable" class="display" style="width:100%" table class="wb-tables table table-striped table-hover" data-wb-tables='{ "ordering" : false }'>`);
                        expect(res.text).to.include(`<button type="button" class="btn btn-default" id="logoutButton">LOGOUT</button>`);
                        done();
                    });
            });
        });
        describe('POST /logout', () => {
            it('Successfully logged out of account (should return 302)', (done) => {
                supertest(app)
                    .post('/logout')
                    .expect(302)
                    .set('Cookie', `token=${loginCookie}`)
                    .end((err, res) => {
                        if (err) throw err;
                        redirectUrl = res.headers.location; // for the next test
                        done();
                    });
            });
            it('Checking if /logout redirected to /login correctly wihtout a cookie', (done) => {
                chai.request(app)
                    .get(redirectUrl)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.be.html;
                        expect(res.text).to.include(`<section class="alert alert-success"><p>Logged out successfully</p></section>`);
                        expect(res.text).to.include('<h1 class="mrgn-bttm-lg">Login</h1>');
                        expect(res.text).to.include('<a href="/register">Register now</a>');
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
                    .send({ email1: 'timxiaa@gmail.com', username1: 'TestUsernameTest', password1: '123abcDEF' })
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
                    .send({ email1: 'TestTest@test.test', username1: 'TimXia77', password1: '123abcDEF' })
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
                    .send({ email1: 'TestTest@test.test', username1: 'TestUsernameTest', password1: '123abcDEF' })
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        expect(res).to.be.html;
                        expect(res.text).to.include('<div class="alert alert-danger"><p>Username and email invalid</p></div>');
                        done();
                    });
            });
        });
        describe('POST /login', () => {
            it('Tried to login with invalid username (should return 401)', (done) => {
                chai
                    .request(app)
                    .post('/login')
                    .send({ username1: 'TestUsernameTestUsernameTest', password1: '123abcDEF' })
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
                    .send({ username1: 'TestUsernameTest', password1: 'badPassword' })
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