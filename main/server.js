
const express = require("express");
var cookieParser = require("cookie-parser");
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser'); //parse body of post req
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
require('dotenv').config();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + "/views")); 

const dataLayer = require("./../data.js"); //Layered System

const registerPage = ["/", "/register"];

cookieJwtAuth = (req, res, next) => {
    const token = req.cookies.token;
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        const expirationTime = decoded.exp * 1000; // Expiration time in milliseconds

        if (Date.now() >= expirationTime) {
            // Token has expired
            res.clearCookie("token");
            return res.redirect("/login");
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie("token");
        return res.redirect("/login");
    }
}

checkLogin = (req, res, next) => {
    const token = req.cookies.token;

    if (token != undefined) { //if the user has logged in
        return res.redirect("/table");
    }
    next();
}

function authRole(role) {
    return (req, res, next) => {
        const dataArr = JSON.parse(`[${dataLayer.readData()}]`); //array with user information
        const targetUser = dataArr.find(user => user.username === req.user.username);

        if (targetUser.role !== role) {
            res.status(401)
            return res.send('Not allowed')
        }

        next()
    }
}

function createUserToken(userName) {
    const user = {username: userName};
    const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: "10m" });
    return token;
}


//Routes

//Registry Page:
app.get(registerPage, checkLogin, (req, res) => {
    res.render('register-en');
});

app.post(registerPage, async (req, res) => { //creates basic accounts 
    const dataArr = JSON.parse(`[${dataLayer.readData()}]`); //array with user information
    const usernameUser = dataArr.find(findUser => findUser.username === req.body.username1);
    const emailUser = dataArr.find(findUser => findUser.email === req.body.email1);
    if (usernameUser && emailUser){ //username and email taken
        res.render('register-en', {msg: '<div class="alert alert-danger"><p>Username and email invalid</p></div>'});
    } else if (emailUser){ //email taken
        res.render('register-en', {msg: '<div class="alert alert-danger"><p>Email already taken</p></div>'});
    } else if (usernameUser) { //user with that username already exists
        res.render('register-en', {msg: '<div class="alert alert-danger"><p>Username already taken</p></div>'});

    } else {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password1, 10); //salt is saved with the hashed password automatically
            const newUser = JSON.stringify({ email: req.body.email1, username: req.body.username1, password: hashedPassword, role: "basic" });
            console.log("\nRegistry information (w/hashed): " + newUser);

            dataLayer.addData(newUser);

            //logging user in:
            const token = createUserToken(req.body.username1);

            res.cookie("token", token, {
                httpOnly: true,
            });

            return res.status(302).redirect('/table');
        } catch {
            res.status(500).send("Error Registering!");
        }
    }
});

//Login Page:
app.get("/login", checkLogin, (req, res) => {
    if (Boolean(req.query.logout) == true){
        console.log("user just logged out");
        res.render('login-en.ejs', {msg: '<section class="alert alert-success"><p>Logged out successfully</p></section>'});
    } else {
        res.render('login-en.ejs');
    }
});

app.post("/login", (req, res) => {

    const dataArr = JSON.parse(`[${dataLayer.readData()}]`); //array with user information
    const targetUser = dataArr.find(user => user.username === req.body.username1);

    if (targetUser == null) {
        return res.status(400).render('login-en', {msg: '<div class="alert alert-danger"><p>Cannot find username</p></div>'});
    }

    //if user found:
    try {
        if (bcrypt.compareSync(req.body.password1, targetUser.password)) { //user is good
            const token = createUserToken(req.body.username1);

            res.cookie("token", token, {
                httpOnly: true,
            });

            return res.redirect("/table");
        } else {
            return res.status(400).render('login-en', {msg: '<div class="alert alert-danger"><p>Invalid Password</p></div>'});
        }
    } catch {
        res.status(500).send();
    }

});


app.get("/table", cookieJwtAuth, (req, res) => {
    res.render('table.ejs');
});


app.post('/logout', (req, res) => {
    res.clearCookie("token");
    res.redirect("/login?logout=true");
});


app.listen(PORT, () => {
    console.log(`Running on port ${PORT}.`);
    console.log("Test this at: ");
    console.log(`http://localhost:${PORT}/register`);
    console.log(`http://localhost:${PORT}/login`);
    console.log(`http://localhost:${PORT}/table`);

});

