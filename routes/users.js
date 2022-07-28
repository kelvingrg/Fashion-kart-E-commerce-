var express = require('express');
// const {response} = require('../app');
const app = require('../app');
const productHelpers = require('../helpers/productHelpers');
var router = express.Router();
var userHelpers =require('../helpers/userHelpers')

const serviceSID="VA385192afb6828f7985b3bb7c66d9320b"
const accountSID="AC6b7b6ce68eb697d1f3929f14a77462bb"
const authToken= "66f6aec867fb0a46c6f9e1f2fd374100"
const client=require("twilio")(accountSID,authToken)


let user;
let otp=false

/* GET users listing. */
router.get('/', function(req, res, next) {
  user=req.session.user;
if(req.session.loggedIn){
  res.render('index',{user})
console.log(req.body.name);
}
  else
  res.render('index')

});

router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }
else{
  res.render('user/loginOrSignUp',{logerr:req.session.logerr,emailerr:req.session.emailerr,phoneerr:req.session.phoneerr})
  req.session.phoneerr=false
  req.session.emailerr=false
  req.session.logerr=false
}

})

router.post('/login',(req,res)=>{

  userHelpers.doLogin(req.body).then((response)=>{
  
    if (response.status) {
      req.session.user = response.user;
      req.session.loggedIn=true;
      console.log(req.session.user)
     
    res.redirect("/");
    } else{
      req.session.logerr=true;
      res.redirect("/login");
    }
  })
  
})

router.post('/signup',(req,res)=>{

 
  userHelpers.userExist(req.body).then((response)=>{
    //console.log(response+'signup response')
     if(response.phone||response.email){

    
      if(response.phone){
        req.session.phoneerr=true
        
       }
      if(response.email){
        req.session.emailerr=true
        
      }
      res.redirect('/login')
    }
     
    if(response.noexist){
    
      userHelpers.doSignup(req.body).then((respone)=>{
        userHelpers.statusUpdate(req.body);
        res.redirect('/')
      })
    }
  
  })
  })
 
router.get('/logout',(req,res)=>{
 
  req.session.loggedIn = false;

  user=null
  req.session.destroy();
  
  res.redirect('/')
})

//single Product
router.get('/singleProduct/:id', function(req, res, next) {
  
  
if(req.session.loggedIn){
  productHelpers.getProduct(req.params.id).then((productData)=>{
    console.log(productData);
    res.render('user/singleProduct',{user,productData,singleProduct:false})
    singleProduct=false
  })
   

}
  else
  res.redirect('/login')

});
//product view
router.get('/productsVeiw', (req, res)=> {
  
  if(req.session.loggedIn){
  productHelpers.getProducts().then((productsData)=>{
   
    res.render('user/productsView',{user,productsData})
  })
    
  }
else
    res.redirect('/login')
  
  });
  router.get('/loginWithOtp', (req, res)=> {
  
    if(req.session.loggedIn){
    productHelpers.getProducts().then((productsData)=>{
     
      res.redirect('/')
    })
      
    }
  else
      res.render('user/loginWithOtp',{otp})
      otp=false
    
    });


  router.post('/mobileNumber',(req,res)=>{
   
    userHelpers.doMobileNumber(req.body).then((number)=>{
      if(number){
        client.verify
        .services(serviceSID)
        .verifications.create({
          to: `+91${req.body.mobileNumber}`,
          channel:"sms"
        })
otp=true;
      }
      res.render('user/loginWithOtp',{otp,mob:req.body.mobileNumber})
      otp=false
  })
  
  })
  router.post('/otpLogin',(req,res)=>{
    console.log(req.body.otp)
    console.log(req.body.mobileNumber)
    client.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: `+91${req.body.mobileNumber}`,
      code:req.body.otp
    }).then((response)=>{
      console.log(response)
      if(response.valid==true){
        userHelpers.doMobileNumber(req.body).then((user)=>{
          req.session.user = user;
          req.session.loggedIn=true;
         res.redirect('/')
        })
      }
      if(response.valid!=true){
        let wrongOtp=true
        res.render('user/loginWithOtp',{otp,mob:req.body.mobileNumber,wrongOtp})
        wrongOtp=false
      }
    })

  })



  

module.exports = router;
