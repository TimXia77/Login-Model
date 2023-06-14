
$(document).ready(function () {
    $('#dataTable').DataTable({
        ajax: 'data/arrays.txt',
    });
});

let select = document.getElementById("select");
let option = document.createElement("option");
option.text = "six";
select.add(option);




//Event Handlers
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('submit').addEventListener('click', submitData);
    document.getElementById('logout').addEventListener('click', logout);
})

function submitData(){ //For testing, prints out the current selected value of the select element.
    let selectElement = document.getElementById("select").value;
    console.log(selectElement);
}

function logout(){ //For testing, prints out the current selected value of the select element.
    console.log('invalidating jwt here (similar to server)');
}

