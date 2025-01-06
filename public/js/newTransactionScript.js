//Event Listeners
document.addEventListener('DOMContentLoaded', (event) => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency) {
        document.getElementById('preferredCurrency').value = savedCurrency;
    }
});

document.querySelector("#amount").addEventListener("change", checkAmount);
document.querySelector("#type").addEventListener("change", checkType);
document.querySelector("#date").addEventListener("change", checkDate);
document.querySelector("#description").addEventListener("change", checkDescription);
document.querySelector("#newTransactionForm").addEventListener("submit", function(event){
    validateForm(event);
});

//functions
async function checkAmount(){
    let x = document.querySelector("#amount").value;
    if(x.length <= 0){
        document.querySelector("#amountError").innerHTML = "Amount is required";
        document.querySelector("#amountError").style.color = "red";
    }
    else{
        document.querySelector("#amountError").innerHTML = "";
        document.querySelector("#amountError").style.color = "black";
    }

}
async function checkType(){
    let x = document.querySelector("#type").value;
    if(x == ""){
        document.querySelector("#typeError").innerHTML = "Type is required";
        document.querySelector("#typeError").style.color = "red";
    }
    else{
        document.querySelector("#typeError").innerHTML = "";
        document.querySelector("#typeError").style.color = "black";
    }
}
async function checkDate(){
    let x = document.querySelector("#date").value;
    if(x == ""){
        document.querySelector("#dateError").innerHTML = "Date is required";
        document.querySelector("#dateError").style.color = "red";
    }
    else{
        document.querySelector("#dateError").innerHTML = "";
        document.querySelector("#dateError").style.color = "black";
    }
}
async function checkDescription(){
    let x = document.querySelector("#description").value;
    if(x == ""){
        document.querySelector("#descriptionError").innerHTML = "Description is required";
        document.querySelector("#descriptionError").style.color = "red";
    }
    else{
        document.querySelector("#descriptionError").innerHTML = "";
        document.querySelector("#descriptionError").style.color = "black";
    }
}

function validateForm(event){
    let amount = document.forms["newTransactionForm"]["amount"].value;
    let type = document.forms["newTransactionForm"]["type"].value;
    let date = document.forms["newTransactionForm"]["date"].value;
    let description = document.forms["newTransactionForm"]["description"].value;
    let isValid = true;

    if(amount == ""){
        document.querySelector("#amountError").innerHTML = "Amount is required";
        document.querySelector("#amountError").style.color = "red";
        isValid = false;
    }
    if(type == ""){
        document.querySelector("#typeError").innerHTML = "Type is required";
        document.querySelector("#typeError").style.color = "red";
        isValid = false;
    }
    if(date == ""){
        document.querySelector("#dateError").innerHTML = "Date is required";
        document.querySelector("#dateError").style.color = "red";
        isValid = false;
    }
    if(description == ""){
        document.querySelector("#descriptionError").innerHTML = "Description is required";
        document.querySelector("#descriptionError").style.color = "red";
        isValid = false;
    }
    if(!isValid){
        event.preventDefault();
        return false;
    }
    return true;
}