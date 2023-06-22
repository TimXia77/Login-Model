
//Requires
const express = require("express");
const app = express();

var cookieParser = require("cookie-parser");
const bodyParser = require('body-parser'); //parse body of post req
const bcrypt = require("bcrypt");
require('dotenv').config();

app.set("view engine", "ejs");

//Middleware
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(__dirname + "/views")); 
app.use(express.json());

//Data access layer
const dataLayer = require("./../data.js"); 

//Helper Modules
const authHelper = require("./authHelper.js")(app);
const cache = require("./cache.js");

//Constants (for readability)
const registerPage = ["/", "/register"];
const PORT = 3000;


//Routes

//Registry Page:
app.get(registerPage, authHelper.checkLogin, cache(15), (req, res) => {
    res.render('register-en');
});

app.post(registerPage, async (req, res) => { 
    const dataArr = JSON.parse(`[${dataLayer.readData()}]`); //array with user information

    const usernameUser = dataArr.find(findUser => findUser.username === req.body.username1); //variables to determine if an account already exists.
    const emailUser = dataArr.find(findUser => findUser.email === req.body.email1);

    if (usernameUser && emailUser){     //username and email taken
        res.status(401).render('register-en', {msg: '<div class="alert alert-danger"><p>Username and email invalid</p></div>'});
        
    } else if (emailUser){              //email taken
        res.status(401).render('register-en', {msg: '<div class="alert alert-danger"><p>Email already taken</p></div>'});

    } else if (usernameUser) {          //user with that username already exists
        res.status(401).render('register-en', {msg: '<div class="alert alert-danger"><p>Username already taken</p></div>'});

    } else {
        try {   //valid information! Creating account

            const hashedPassword = await bcrypt.hash(req.body.password1, 10); //hashing salt is saved with the hashed password automatically
            const newUser = JSON.stringify({ email: req.body.email1, username: req.body.username1, password: hashedPassword, role: "basic" });

            dataLayer.addData(newUser); 

            //logging user in:
            const token = authHelper.createUserToken(req.body.username1);
            //console.log("Print token from server: " + token);
            res.cookie("token", token);

            res.status(200).redirect('/table');
        } catch {
            res.status(500).send("Error Registering!");
        }
    }
});

//Login Page:
app.get("/login", authHelper.checkLogin, cache(15), (req, res) => {
    if (Boolean(req.query.logout) == true){ //If the user just logged out
        res.render('login-en.ejs', {msg: '<section class="alert alert-success"><p>Logged out successfully</p></section>'});
    } else {
        res.render('login-en.ejs');
    }
});

app.post("/login", (req, res) => {

    const dataArr = JSON.parse(`[${dataLayer.readData()}]`); //array with user information
    const targetUser = dataArr.find(user => user.username === req.body.username1);

    if (targetUser == null) { //Invalid username
        return res.status(401).render('login-en', {msg: '<div class="alert alert-danger"><p>Cannot find username</p></div>'});
    }

    //if user found:
    try {
        if (bcrypt.compareSync(req.body.password1, targetUser.password)) { //User is logged in
            const token = authHelper.createUserToken(req.body.username1);

            // res.cookie("token", token, {
            //     httpOnly: true, //client-side scripts cannot access the cookie
            // });

            res.cookie("token", token);

            return res.redirect("/table"); //status 200

        } else { //Invalid password
            return res.status(401).render('login-en', {msg: '<div class="alert alert-danger"><p>Invalid Password</p></div>'});
        }
    } catch {
        res.status(500).send();
    }

});

//Logout
app.post('/logout', (req, res) => {
    if (req.cookies.token){
        res.clearCookie("token");
        res.status(302).redirect("/login?logout=true");
    } else {
        res.status(405).send("Invalid JWT");
    }
});


//Data page
app.get("/table", authHelper.cookieJwtAuth, cache(15), (req, res) => { 
    res.render('table.ejs');
});

//Start the server
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}.`);
    console.log("Test this at: ");
    console.log(`http://localhost:${PORT}/register`);
    console.log(`http://localhost:${PORT}/login`);
    console.log(`http://localhost:${PORT}/table`);
});

module.exports = app; //For automated testing