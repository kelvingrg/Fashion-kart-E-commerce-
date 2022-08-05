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
    var password2=document.getElementById("confirmPassword").value;
   
    if(password1===password2&& password1!="")
    {
        document.getElementById("labelPassword").innerHTML="done";
        document.getElementById("labelPassword").style.visibility="visible";
        document.getElementById("labelPassword").style.color="green";
        pass=true
        document.getElementById("resetPasswordSubmit").style.visibility="visible";
  
    
    }
    else{
        document.getElementById("labelPassword").innerHTML="password mismatch";
document.getElementById("labelPassword").style.visibility="visible";
document.getElementById("labelPassword").style.color="red";
pass=false
document.getElementById("resetPasswordSubmit").style.visibility="hidden";
}
    }

    function validateSubmission(){
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
             pass=false
             return true;

        }else
        {
            invalid('labelSubmission');
            return false;
        }

    }



function valid(labelname){
    console.log(labelname)
    document.getElementById(labelname).innerHTML="Valid";
    document.getElementById(labelname).style.visibility="visible";
    setTimeout(() => {
        document.getElementById(labelname).style.visibility="none";
    }, 5000);
    document.getElementById(labelname).style.color="green";

}
function invalid(labelname){
document.getElementById(labelname).innerHTML="check your entries";
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

       