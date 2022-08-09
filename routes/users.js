var express = require("express");
const {Db} = require("mongodb");
const {response} = require("../app");
// const {response} = require('../app');
const app = require("../app");
const adminHelpers = require("../helpers/adminHelpers");
const productHelpers = require("../helpers/productHelpers");
var router = express.Router();
var userHelpers = require("../helpers/userHelpers");
require('dotenv').config()
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

let user;
let otp = false;
// middle ware to check the session
verifyLoggedIn = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
};

/* GET users listing. */
router.get("/", async function (req, res, next) {
    user = req.session.user;
    if (req.session.loggedIn) {
        let cartItemsCount = await userHelpers.getCartItemsCount(req.session.user._id)
        user.cartCount = cartItemsCount;
        adminHelpers.getBannerOne().then((bannerData) => {
            res.render("index", {user, bannerData});

        })


    } else {
        adminHelpers.getBannerOne().then((bannerData) => {
            res.render("index", {bannerData,user});
        })
    }
});

router.get("/login", (req, res) => {
    if (req.session.loggedIn) {
        res.redirect("/");
    } else {
        res.render("user/loginOrSignUp", {
            logerr: req.session.logerr,
            emailerr: req.session.emailerr,
            phoneerr: req.session.phoneerr,
            blocked: req.session.block
        });
        req.session.phoneerr = false;
        req.session.emailerr = false;
        req.session.block = false;
        req.session.logerr = false;
    }
});

router.post("/login", (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
        console.log(response.block);
        if (response.status) {
            req.session.user = response.user;
            req.session.loggedIn = true;
            console.log(response.block);

            res.redirect("/");
        } else if (response.block) {
            req.session.block = response.block;
            req.session.block = true;
            res.redirect("/login");
        } else {
            req.session.logerr = true;
            res.redirect("/login");
        }
    });
});

router.post("/signup", (req, res) => {
    userHelpers.userExist(req.body).then((response) => { // console.log(response+'signup response')
        if (response.phone || response.email) {
            if (response.phone) {
                req.session.phoneerr = true;
            }
            if (response.email) {
                req.session.emailerr = true;
            }
            res.redirect("/login");
        }

        if (response.noexist) {
            userHelpers.doSignup(req.body).then((respone) => {
                userHelpers.statusUpdate(req.body);
                res.redirect("/");
            });
        }
    });
});

router.get("/logout", (req, res) => {
    req.session.loggedIn = false;

    user = null;
    req.session.destroy();

    res.redirect("/");
});

// single Product
router.get("/singleProduct/:id", function (req, res, next) {
    if (req.session.loggedIn) {
        productHelpers.getProduct(req.params.id).then((productData) => {
            console.log(productData);
            res.render("user/singleProduct", {user, productData, singleProduct: false});
            singleProduct = false;
        });
    } else 
        res.redirect("/login");
    
});
// product view
router.get("/productsVeiw", (req, res) => {
    if (req.session.loggedIn) {
        productHelpers.getProducts().then((productsData) => {
            res.render("user/productsView", {user, productsData});
        });
    } else 
        res.redirect("/login");
    
});
// otp login
router.get("/loginWithOtp", (req, res) => {
    if (req.session.loggedIn) {
        productHelpers.getProducts().then((productsData) => {
            res.redirect("/");
        });
    } else 
        res.render("user/loginWithOtp", {otp});
     otp = false;
});

// otp enter mobile number

router.post("/mobileNumber", (req, res) => {
    userHelpers.doMobileNumber(req.body).then((number) => {
        if (number) {
            client.verify.services(process.env.SERVICE_SID).verifications.create({to: `+91${
                    req.body.mobileNumber
                }`, channel: "sms"}).then((resolve) => {
                console.log(resolve);
            });
            otp = true;
        }
        res.render("user/loginWithOtp", {otp, mob: req.body.mobileNumber});
        otp = false;
    });
});
router.post("/otpLogin", (req, res) => {
    client.verify.services(process.env.SERVICE_SID).verificationChecks.create({to: `+91${
            req.body.mobileNumber
        }`, code: req.body.otp}).then((response) => {
        if (response.valid == true) {
            userHelpers.doMobileNumber(req.body).then((user) => {
                if (user.state == true) {
                    req.session.user = user;
                    req.session.loggedIn = true;
                    res.redirect("/");
                }
                if (user.state == false) {
                    req.session.block = true;

                    res.render("user/loginWithOtp", {
                        otp,
                        mob: req.body.mobileNumber,
                        wrongOtp,
                        block: req.session.block
                    });
                    wrongOtp = false;
                    req.session.block = false;
                }
            });
        }
        if (response.valid == false) {
            let wrongOtp = true;
            otp = true;
            res.render("user/loginWithOtp", {
                otp,
                mob: req.body.mobileNumber,
                wrongOtp
            });
            wrongOtp = false;
        }
    });
});
// mhy account
router.get("/myAccount", (req, res) => {
    if (req.session.loggedIn) {
        userHelpers.doGetUser(user).then((reuser) => {
            req.session.user = reuser;
            user = reuser;

            res.render("user/myAccount", {user});
        });
    } else {
        res.redirect("/login");
    }
});
// password reset
router.post("/passwordReset", verifyLoggedIn, (req, res) => {
    userHelpers.updatePassword(req.body, user).then((response) => {
        console.log(response.updatepass);
        res.json(response);
    });
});

// personal Update

router.post("/personalDataUpdate", (req, res) => {
    userHelpers.updatePersonalData(req.body, user).then((response) => {
        respone = 'hai'
        res.json(response);
    });
});

// add to cart

router.get("/addToCart/:id", verifyLoggedIn, (req, res) => {
    console.log('reached at routing file');
    userHelpers.addToCart(req.params.id, req.session.user._id).then((response) => {
        console.log("rotes ater adding promise")

        res.json({status: true})
    })
})
// cart Page
router.get("/cartPage", verifyLoggedIn, async (req, res) => {


    let cartProducts = await userHelpers.getCartProducts(req.session.user._id)
    let totalCost = await userHelpers.getTotalAmount(req.session.user._id)
    res.render("user/cart", {cartProducts, user, totalCost})
})


// increment or decrement of cart items count
router.post('/changeProductQuantity', (req, res, next) => {
    userHelpers.changeProductQuantity(req.body).then(async (response) => {
        response.total = await userHelpers.getTotalAmount(req.body.user)
        res.json(response)

    })


})
// check out page

router.get("/checkOut", verifyLoggedIn, async (req, res, next) => {
    let totalCost = await userHelpers.getTotalAmount(req.session.user._id)
    res.render('user/checkOut', {user, totalCost})

})
// place order post
router.post('/placeOrder', async (req, res) => {
    let products = await userHelpers.getCartProductList(req.session.user._id)
    let totalCost = await userHelpers.getTotalAmount(req.session.user._id)
    console.log(products, totalCost)
    userHelpers.placeOrder(req.body, products, totalCost).then((response) => {
        res.json(response)

    })
})
// delete one product from cart
router.post('/deleteOneCarProduct', (req, res) => {
    console.log(req.body, "reaches at delete one product routes");
    userHelpers.deleteOneCarProduct(req.body).then((response) => {})
})

// order history
router.get('/orderHistory', verifyLoggedIn, (req, res) => {
    console.log('reacheed at routes ');
    userHelpers.orderHistory(user._id).then((orderHistoryData) => {
        res.render('user/orderHistory', {user, orderHistoryData})

    })

})

// view more order details from order history 

router.get('/viewOrderDetails/:id',(req,res)=>{
    console.log(req.params.id)
 userHelpers.viewOrderDetails(req.params.id).then((singleOrderData)=>{
   res.render('user/singleOrderView',{user,singleOrderData})
   console.log(user);
 })

})
router.get('/orderPlacementSuccess/:id',async(req,res)=>{
   
 userHelpers.viewOrderDetails(req.params.id).then((singleOrderData)=>{
console.log(singleOrderData)
console.log(singleOrderData.orderData[0].deliveryDetails.name,'totoal amounrt');
        res.render('user/orderPlacementSuccess',{user,singleOrderData})

    })
   
  })

   





module.exports = router;
