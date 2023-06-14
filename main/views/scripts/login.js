
// function login(){
//     console.log("heelo"); 

//     //LEAVE FORM ACTION IN AND SEE IF YOU CAN ASK THE SERVER FOR VALIDITY??
    
//     //EJS TO LOAD IN ERR MSG?





//     let reqObj = {
//         username1: document.getElementById('username1').value,
//         password1: document.getElementById('password1').value
//     }

//     fetch(`/login`, { 
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(reqObj)
//     })
//     .then(response => {
//         if (response.ok) {

//             console.log("Logged in successfully");
            

//         } else {
//             console.log("Failed to login");
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });
//     document.getElementById('newData').value = "";
// }



// document.addEventListener('DOMContentLoaded', function() {
//     document.getElementById('loginButton').addEventListener('click', login);
// })