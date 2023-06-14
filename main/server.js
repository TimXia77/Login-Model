
const express = require("express");
var cookieParser = require("cookie-parser");
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser'); //parse body of post req
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const dataLayer = require("./../data.js"); //Layered System

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + "/public")); 


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
    res.sendFile(__dirname + '/public/register-en.html');
});

app.post(registerPage, async (req, res) => { //creates basic accounts 
    const dataArr = JSON.parse(`[${dataLayer.readData()}]`); //array with user information
    const targetUser = dataArr.find(findUser => findUser.username === req.body.username1);
    if (targetUser) { //user with that username already exists
        res.send("Username already taken!")

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

app.get("/login", checkLogin, (req, res) => {
    res.sendFile(__dirname + '/public/login-en.html');
});

app.post("/login", (req, res) => {

    const dataArr = JSON.parse(`[${dataLayer.readData()}]`); //array with user information
    const targetUser = dataArr.find(user => user.username === req.body.username1);

    if (targetUser == null) {
        return res.status(400).send('Cannot find username')
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
            res.send("Invalid Password.")
        }
    } catch {
        res.status(500).send();
    }

});

app.post('/logout', (req, res) => {
    res.send('Logout successful');
});


app.get("/table", cookieJwtAuth, (req, res) => {
    res.sendFile(__dirname + '/public/table.html');
});

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
})

app.get("/adminPage", cookieJwtAuth, authRole("admin"), (req, res) => {
    res.send("You are admin user: " + req.user.username);
    //res.sendFile(__dirname + '/public/table.html');
});

app.get("/basicPage", cookieJwtAuth, authRole("basic"), (req, res) => {
    res.send("You are basic user: " + req.user.username);
    //res.sendFile(__dirname + '/public/table.html');
});



app.listen(PORT, () => {
    console.log(`Running on port ${PORT}.`);
    console.log("Test this at: ");
    console.log(`http://localhost:${PORT}/register`);
    console.log(`http://localhost:${PORT}/login`);
    console.log(`http://localhost:${PORT}/table`);

});

