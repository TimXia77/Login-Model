
//Requires
const express = require("express");
const app = express();

const cors = require('cors');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
var cookieParser = require("cookie-parser");
const bodyParser = require('body-parser'); //parse body of post req
require('dotenv').config();

app.set("view engine", "ejs");

//Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
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
const swaggerDocument = YAML.load('./apiSpecification.yaml');

const swaggerOptions = {
    swaggerDefinition: swaggerDocument,
    apis: ['./server.js'], // Update with your actual route files
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); //http://localhost:3000/api-docs

//Routes

//Registry Page:
app.get(registerPage, authHelper.checkLogin, cache(15), (req, res) => {
    res.render('register-en');
});

app.post(registerPage, async (req, res) => {
    if (!((req.body.email).includes("@"))) {        //Check if username, password, and email pass restrictions
        return res.status(400).render('register-en', { msg: '<div class="alert alert-danger"><p>Invalid format for email</p></div>' });

    } else if (!(/^[a-zA-Z0-9_]{2,}$/.test(req.body.username))) {
        return res.status(400).render('register-en', { msg: '<div class="alert alert-danger"><p>Invalid format for username</p></div>' });

    } else if (!(/[0-9]/.test(req.body.password) && /[A-Z]/.test(req.body.password) && /[a-z]/.test(req.body.password) && (req.body.password).length >= 8)) {
        return res.status(400).render('register-en', { msg: '<div class="alert alert-danger"><p>Invalid format for password</p></div>' });

    }

    const dataArr = dataLayer.readUsers(); //array with user information

    const usernameUser = dataArr.find(findUser => findUser.username === req.body.username); //variables to determine if an account already exists.
    const emailUser = dataArr.find(findUser => findUser.email === req.body.email);

    if (usernameUser && emailUser) {     //username and email taken
        return res.status(401).render('register-en', { msg: '<div class="alert alert-danger"><p>Username and email taken</p></div>' });

    } else if (emailUser) {              //email taken
        return res.status(401).render('register-en', { msg: '<div class="alert alert-danger"><p>Email already taken</p></div>' });

    } else if (usernameUser) {          //user with that username already exists
        return res.status(401).render('register-en', { msg: '<div class="alert alert-danger"><p>Username already taken</p></div>' });

    } else {
        try {   //valid information! Creating account

            await (dataLayer.addUser(req.body.email, req.body.username, req.body.password));

            //logging user in:
            const token = authHelper.createUserToken(req.body.username);
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
    if (Boolean(req.query.logout) == true) { //If the user just logged out
        res.render('login-en.ejs', { msg: '<section class="alert alert-success"><p>Logged out successfully</p></section>' });
    } else {
        res.render('login-en.ejs');
    }
});

app.post("/login", (req, res) => {

    if (dataLayer.findUser(req.body.username, req.body.password)){
        try {
            const token = authHelper.createUserToken(req.body.username);
            res.cookie("token", token);
    
            return res.redirect("/table"); //status 200
            
        } catch {
            res.status(500).send();
        }
    } else {
        return res.status(401).render('login-en', { msg: '<div class="alert alert-danger"><p>Invalid password or username</p></div>' });
    }

});

//Logout
app.post('/logout', (req, res) => {
    if (req.cookies.token) {
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
    console.log(`\nRunning on port ${PORT}.`);
    console.log("Test this at: ");
    console.log(`http://localhost:${PORT}/register`);
    console.log(`http://localhost:${PORT}/login`);
    console.log(`http://localhost:${PORT}/table`);
    console.log("\nOr check out the specification:") 
    console.log(`http://localhost:3000/api-docs`);
});

module.exports = app; //For automated testing