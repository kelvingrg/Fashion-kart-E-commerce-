const { response } = require("express");
const e = require("express");
var express = require("express");
var router = express.Router();
var adminHelpers = require("../helpers/adminHelpers");
var userHelpers = require("../helpers/userHelpers");

let admin = {};
admin.email = "admin@gmail.com";
admin.password = "123";
admin.name = "Admin";

/* GET home page. */

verifyLoggedIn = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin");
  }
};

router.get("/", function (req, res, next) {
  if (req.session.admin) {
    res.redirect("/admin/dashbord");
  } else {
    res.render("admin/loginPage", {
      adminlogin: true,
      logerr: req.session.logerr,
    });
    req.session.logerr = false;
  }
});
router.post("/login", (req, res) => {
  if (req.body.email === admin.email && req.body.password === admin.password) {
    req.session.admin = true;
    res.redirect("/admin/dashbord");
    // res.redirect('/dashbord')
  } else {
    req.session.logerr = true;
    res.redirect("/admin/");
  }
});

router.get("/dashbord", verifyLoggedIn, (req, res) => {
  res.render("admin/index", { admin: true });
});

router.get("/logout", (req, res) => {
  req.session.admin = false;

  req.session.destroy();
  res.redirect("/admin/");
});

router.get("/userDetails", verifyLoggedIn, (req, res) => {
  adminHelpers.getAllUsers().then((user) => {
    res.render("admin/userDetails", { admin: true, user });
  });
});
router.get("/productDetails", verifyLoggedIn, (req, res) => {
  adminHelpers.getAllUsers().then((user) => {
    res.render("admin/ProductDetails", { admin: true, user });
  });
});
router.get("/addUser", verifyLoggedIn, (req, res) => {
    res.render("admin/addUser", { admin:true,emailerr:req.session.emailerr,phoneerr:req.session.phoneerr});
    req.session.emailerr=false
    req.session.phonerr=false
});
router.post("/addUser", (req, res) => {
  userHelpers.userExist(req.body).then((response)=>{
     if(response.phone||response.email){
      if(response.phone){
        req.session.phoneerr=true
       }
      if(response.email){
        req.session.emailerr=true
      }
      res.redirect("/admin/addUser")
    }
   
    if(response.noexist){
      
      adminHelpers.addUser(req.body).then((respone)=>{
        userHelpers.statusUpdate(req.body);
        res.redirect("/admin/userDetails")
      })
    }
  
  })
  })
  router.get("/updateUser/:id", verifyLoggedIn, (req, res) => {
    adminHelpers.getUser(req.params.id).then((userData) => {
      res.render("admin/updateUser", { admin: true, userData,logerr:false,emailerr:false});
    })
  })
  router.post("/updateUser/:id", (req, res) => {
    console.log(req.body)
        adminHelpers.updateUser(req.params.id,req.body)
         .then((respone)=>{
     
        res.redirect("/admin/userDetails")
         })
        })
    
      
  




module.exports = router;
