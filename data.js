
const fs = require("fs");

function readData() {
    return fs.readFileSync('../accounts.txt', 'utf8');
}

function addData(newData) {
    if (readData().trim() == "") { //if first account added

        fs.appendFile("../accounts.txt", newData, err => {
            if (err) {
                console.err;
                return;
            }
        });

    } else {
        let modifiedData = ", " + newData
        fs.appendFile("../accounts.txt", modifiedData, err => {
            if (err) {
                console.err;
                return;
            }
        });

    }
}

function writeData(dataString) {
    fs.writeFile("../accounts.txt", dataString, err => {
        if (err) {
            console.error(err);
            console.log("error occured when updating login textfile");
            return;
        }
    });
}

function deleteUser(targetUsername) {
    let accounts = JSON.parse(`[${readData()}]`);
    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].username === targetUsername) {
            accounts.splice(i, 1);
            const newAccounts = JSON.stringify(accounts).substring(1, JSON.stringify(accounts).length - 1);
            writeData(newAccounts);
            return;
        }
    }
    //tried to deleted a user that doesn't exist
}


function clearData() {
    fs.writeFile("../accounts.txt", '', err => {
        if (err) {
            console.error(err);
            console.log("error occured when clearing login textfile");
            return;
        }
    });
}

module.exports = {
    addData,
    readData,
    writeData,
    deleteUser,
    clearData
};