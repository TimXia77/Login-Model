
$(document).ready(function () {
    $('#dataTable').DataTable({
        ajax: 'data/arrays.txt',
    });
});


//Event Handlers
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('logoutButton').addEventListener('click', logout);
})

function logout(){ //For testing, prints out the current selected value of the select element.
    fetch(`/logout`, { 
        method: 'POST',
    })
    .then(response => {
        if (response.ok) {
            console.log("Logged out successfully");  
            window.location.href = response.url;      
        } else {
            console.log("Failed logout");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

