//Event Listeners
document.querySelector("#firstName").addEventListener("change", checkFirstName);
document.querySelector("#lastName").addEventListener("change", checkLastName);
document.querySelector("#email").addEventListener("change", checkEmail);
document.querySelector("#password").addEventListener("change", checkPassword);
document.querySelector("#editUserForm").addEventListener("submit", function(event){
    validateForm(event);
});

//functions
async function checkFirstName(){
    let x = document.querySelector("#firstName").value;
    if(x.length == 0){
        document.querySelector("#firstNameError").innerHTML = "First name is required";
        document.querySelector("#firstNameError").style.color = "red";
    }
    else{
        document.querySelector("#firstNameError").innerHTML = "";
        document.querySelector("#firstNameError").style.color = "black";
    }

}
async function checkLastName(){
    let x = document.querySelector("#lastName").value;
    if(x.length == 0){
        document.querySelector("#lastNameError").innerHTML = "Last name is required";
        document.querySelector("#lastNameError").style.color = "red";
    }
    else{
        document.querySelector("#lastNameError").innerHTML = "";
        document.querySelector("#lastNameError").style.color = "black";
    }
}
async function checkEmail(){
    let x = document.querySelector("#email").value;
    if(x.length == 0){
        document.querySelector("#emailError").innerHTML = "Email is required";
        document.querySelector("#emailError").style.color = "red";
    }
    else{
        document.querySelector("#emailError").innerHTML = "";
        document.querySelector("#emailError").style.color = "black";
    }
}
async function checkPassword(){
    let x = document.querySelector("#password").value;
    if(x.length > 0 && x.length < 6){
        document.querySelector("#passwordError").innerHTML = "Password is required";
        document.querySelector("#passwordError").style.color = "red";
    }
    else{
        document.querySelector("#passwordError").innerHTML = "";
        document.querySelector("#passwordError").style.color = "black";
    }
}

function validateForm(event){
    let firstName = document.forms["editUserForm"]["firstName"].value;
    let lastName = document.forms["editUserForm"]["lastName"].value;
    let email = document.forms["editUserForm"]["email"].value;
    let password = document.forms["editUserForm"]["password"].value;
    /*console.log(firstName);
    console.log(lastName);
    console.log(email);
    console.log(password);*/
    let isValid = true;

    if(firstName == ""){
        document.querySelector("#firstNameError").innerHTML = "First name is required";
        document.querySelector("#firstNameError").style.color = "red";
        console.log("First name is required");
    }
    if(lastName == ""){
        document.querySelector("#lastNameError").innerHTML = "Last name is required";
        document.querySelector("#lastNameError").style.color = "red";
        isValid = false;
    }
    if(!email.includes("@")){
        document.querySelector("#emailError").innerHTML = "Enter a valid email";
        document.querySelector("#emailError").style.color = "red";
        isValid = false;
    }
    if(password.length > 0 && password.length < 6){
        document.querySelector("#passwordError").innerHTML = "Password must be at least 6 characters";
        document.querySelector("#passwordError").style.color = "red";
        isValid = false;
    }
    if(!isValid){
        event.preventDefault();
        return false;
    }
    return true;
}