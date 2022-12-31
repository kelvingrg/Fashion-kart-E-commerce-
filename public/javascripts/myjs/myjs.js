let fn =false
let ln=false
let mn=false
let pin=false
let pass=false
function validateFirstName(){
   
    var text=document.getElementById("firstName").value;
    var regx=/^[a-zA-Z ]+$/;
    if(regx.test(text))
    { 
        valid('labelname')
        fn=true
    }
    else{
        invalid('labelname')
        fn=false
        }
       }
function validateSecondName(){
   
    var text=document.getElementById("lastName").value;
    var regx=/^[a-zA-Z ]+$/;
    if(regx.test(text))
    {
        valid('labellastname')
       ln=true
    }
    else{
        invalid('labellastname')
        ln=false
    }

}
function validateNumber(){
   
    var text=document.getElementById("mobileNumber").value;
    var regx=/^([0-9]{10})+$/;
    if(regx.test(text))
    {
        valid('labelMobile')
        mn=true;
        return true
    }
    else{
        invalid('labelMobile')
       mn= false ;
    }

}
function validatePinCode(){
   
    var text=document.getElementById("pinCode").value;
    var regx=/^([0-9]{6})+$/;
    if(regx.test(text))
    {
        valid('labelPin')
        pin=true;
    }
    else{
        invalid('labelPin')
       pin= false ;
    }

}
function validatePassword(){
    var password1=document.getElementById("password").value; 
    var regx=
    // /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,40}$/;
    /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z]).{6,}$/;

    if(regx.test(password1)){
      
    var password2=document.getElementById("confirmPassword").value;
   
    if(password1===password2&& password1!="")
    {
        document.getElementById("labelPassword").innerHTML="<strong><i class='pe-7s-like2'> <i/></strong>";
        document.getElementById("labelPassword").style.visibility="visible";
        document.getElementById("labelPassword").style.color="green";
        pass=true
     
  
    
    }
    else{
        document.getElementById("labelPassword").innerHTML="password mismatch";
document.getElementById("labelPassword").style.visibility="visible";
document.getElementById("labelPassword").style.color="red";
pass=false

}
    }
    else{
     
       let errors = [];
        if (password1.length < 6) {
            errors.push("Your password must be at least 6 characters"); 
        }else   errors.push("")
        if (password1.search(/[a-z]/i) < 0 || password1.search(/[A-Z]/i)<0 ) {
            errors.push("Your password must contain at least one letter.");
        }else   errors.push("")
        if (password1.search(/[0-9]/) < 0) {
            errors.push("Your password must contain at least one digit."); 
        }else   errors.push("")
        if (password1.search(/[!,@,#,$,%,^,&,*,]/) < 0) {
            errors.push("Your password should contain atleast one special character."); 
        }else   errors.push("")
      
console.log(errors);
         
    document.getElementById("labelPassword").innerHTML=errors[0]+"<br>"+errors[1]+"<br>"+errors[2]+"<br>"+errors[3]
        document.getElementById("labelPassword").style.visibility="visible";
        document.getElementById("labelPassword").style.color="red";
        


        
            }
    }

    function validateSubmission(){
        event.preventDefault();
        validatePassword()
        validatePinCode()
        validateNumber()
        validateSecondName()
        validateFirstName()
        if (fn==true&&ln==true&&mn==true&&pin==true&&pass==true){

            fn =false
             ln=false
             mn=false
             pin=false
             document.getElementById('loginForm').submit();
             return true;

        }else
        {
            invalid('labelSubmission');
            return false;
        }

    }



function valid(labelname){

    document.getElementById(labelname).innerHTML="<strong><i class='pe-7s-like2'> <i/></strong>";
    document.getElementById(labelname).style.visibility="visible";
    setTimeout(() => {
        document.getElementById(labelname).style.visibility="none";
    }, 5000);
    document.getElementById(labelname).style.color="green";

}
function invalid(labelname){
document.getElementById(labelname).innerHTML="<i class='pe-7s-close-circle'> check your entries!<i/>";
document.getElementById(labelname).style.visibility="visible";
document.getElementById(labelname).style.color="red";
}

function otpPage(){
    var text=document.getElementById("mobileNumber").value;
    var regx=/^([0-9]{10})+$/;
    if(regx.test(text))
    {
        valid('labelMobile')
       
        document.getElementById("otpVerify").style.visibility="visible";
    }
    else{
        invalid('labelMobile')
     
    }

}

