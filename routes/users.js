var express = require('express');
const { response } = require('../app');
const app = require('../app');
var router = express.Router();
var userHelpers =require('../helpers/userHelpers')



/* GET users listing. */
router.get('/', function(req, res, next) {
  let user=req.session.user;
if(req.session.loggedIn){
  res.render('index',{user})
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

  // console.log(req.body)

  userHelpers.doLogin(req.body).then((response)=>{
    console.log(response.user)
    console.log(response.status)
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
    console.log(response+'signup response')
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
 
router.post('/logout',(req,res)=>{
  req.session.loggedIn = false;
  req.session.destroy();
})

module.exports = router;
