
const fs = require("fs");

function readData(){
    return fs.readFileSync('../accounts.txt','utf8');
}

function addData(newData){
    if (readData().trim() == ""){ //if first account added

        fs.appendFile("../accounts.txt", newData, err => {
            if(err){
                console.err;
                return;
            }
        });

    } else {
        let modifiedData = ", " + newData
        fs.appendFile("../accounts.txt", modifiedData, err => {
            if(err){
                console.err;
                return;
            }
        });

    }
}

function writeData(dataString){
    fs.writeFile("../accounts.txt", dataString, err => {
        if (err){
            console.error(err);
            console.log("error occured when updating login textfile");
            return;
        }
    });
}

function clearData(){
    fs.writeFile("../accounts.txt", '', err => {
        if (err){
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
    clearData
};