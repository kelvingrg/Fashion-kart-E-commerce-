var express = require("express");
const adminHelpers = require("../helpers/adminHelpers");
const productHelpers = require("../helpers/productHelpers");
var router = express.Router();
var userHelpers = require("../helpers/userHelpers");
require('dotenv').config()
const paypal = require("paypal-rest-sdk");


const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

let k=(async()=>{
let c=await userHelpers.getCatagory()
return c
})

// function categoryHeaderData(){
//    userHelpers.getCatagory()
// }
    


let user;
let otp = false;
let insertedIds = null // last placed order id
let convertedRate = 0
let totalCost
let couponApplied
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
        adminHelpers.getBannerOne().then(async(bannerData) => {
        res.render("index", {user, bannerData,categoryData:await k()});

        })

    } else {
        adminHelpers.getBannerOne().then(async(bannerData) => {
            res.render("index", {bannerData,categoryData:await k()});
            
        })
    }
});

router.get("/login", async(req, res) => {
    if (req.session.loggedIn) {
        res.redirect("/");
    } else {
        res.render("user/loginOrSignUp", {
            logerr: req.session.logerr,
            emailerr: req.session.emailerr,
            phoneerr: req.session.phoneerr,
            blocked: req.session.block,categoryData:await k()
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
        productHelpers.getProduct(req.params.id).then(async(productData) => {
          productData[0].offerPercentage=Math.round((parseInt(productData[0].regularPrice)-parseInt(productData[0].offerPrice))/parseInt(productData[0].regularPrice)*100)
            console.log(productData[0].offerPercentage,'..............................offerpercentage')
            res.render("user/singleProduct", {user, productData,categoryData:await k()});
           
        });
    } else 
        res.redirect("/login")
});
// product view 
router.get("/productsVeiw", (req, res) => {
    // if (req.session.loggedIn) {
        productHelpers.getProducts().then(async(productsData) => {
            res.render("user/productsView", {user, productsData,categoryData:await k()});
        });
    // } else 
        res.redirect("/login");
    

});
router.get("/productsVeiwSubCata/:subcata", async(req, res) => {
   console.log(req.params,'reched at routes with subacta',req.url)
        await productHelpers.getProducts().then(async(productsData) => {
            console.log(productsData)
            res.send('haiiiiii')
            // res.render("user/productsView", {user, productsData,categoryData:await k()});
        });
});
// otp login
router.get("/loginWithOtp", async(req, res) => {
    if (req.session.loggedIn) {
        productHelpers.getProducts().then((productsData) => {
            res.redirect("/");
        });
    } else 
        res.render("user/loginWithOtp", {otp,categoryData:await k()});
     otp = false;
});

// otp enter mobile number

router.post("/mobileNumber", (req, res) => {
    userHelpers.doMobileNumber(req.body).then(async(number) => {
        if (number) {
            client.verify.services(process.env.SERVICE_SID).verifications.create({
                    to: `+91${
                    req.body.mobileNumber
                }`,
                channel: "sms"
            }).then((resolve) => {
               
            });
            otp = true;
        }
        res.render("user/loginWithOtp", {otp, mob: req.body.mobileNumber,categoryData:await k()});
        otp = false;
    });
});
router.post("/otpLogin", (req, res) => {
    client.verify.services(process.env.SERVICE_SID).verificationChecks.create({
            to: `+91${
            req.body.mobileNumber
        }`,
        code: req.body.otp
    }).then(async(response) => {
        if (response.valid == true) {
            userHelpers.doMobileNumber(req.body).then(async(user) => {
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
                        block: req.session.block,categoryData:await k()
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
                wrongOtp,
                categoryData:await k()
            });
            wrongOtp = false;
        }
    });
});
// mhy account
router.get("/myAccount", (req, res) => {
    if (req.session.loggedIn) {
        userHelpers.doGetUser(user).then(async(reuser) => {
            req.session.user = reuser;
            user = reuser;

            res.render("user/myAccount", {user,categoryData:await k()});
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

router.post("/personalDataUpdate",verifyLoggedIn, (req, res) => {
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
    console.log(cartProducts,totalCost,user,"...........total cost  cartProducts")
    res.render("user/cart", {cartProducts, user, totalCost,categoryData:await k()})
})


// increment or decrement of cart items count
router.post('/changeProductQuantity',verifyLoggedIn, (req, res, next) => {
    userHelpers.changeProductQuantity(req.body).then(async (response) => {
        response.total = await userHelpers.getTotalAmount(req.body.user)
        res.json(response)

    })


})
// check out page

router.get("/checkOut",verifyLoggedIn, async (req, res, next) => {
    let totalCost = await userHelpers.getTotalAmount(req.session.user._id)
    res.render('user/checkOut', {user, totalCost,categoryData:await k()})

})


// coupon code check 
router.post('/couponCodeCheck',verifyLoggedIn,async(req,res)=>{
  let couponData= await userHelpers.validateCoupon(req.body,req.session.user._id) 
  couponApplied={...couponData}// declaring this data to globally , to save the coupon applied details on order and user db 
   let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
  totalCost=totalValue[0].total
  console.log(couponData,totalCost)
  if(couponData.couponData){
    let finalAmount,offerAmountAvailable 
   let offerAmountActual=totalCost/100*couponData.couponData.offerPercentage
  
    if(offerAmountActual>couponData.couponData.offerCap)
    {
      finalAmount=totalCost-couponData.couponData.offerCap         
     offerAmountAvailable=couponData.couponData.offerCap
    }
   else{         
   finalAmount=totalCost-offerAmountActual               
    offerAmountAvailable=offerAmountActual
      }          
      res.json({finalAmount,offerAmountAvailable})
      totalCost=finalAmount                                  // declaring globally to get this value while order placing  
    }
    else{
        
          couponApplied={couponData: {         
            _id:null,   
            couponData: null,          
                offerPercentage: null,
                offerCap: null
               
              }}
          
        res.json(couponData)
    }
  
     
})




// place order post
router.post('/placeOrder',verifyLoggedIn, async (req, res) => {
    console.log(req.body, 'place order ')

    let products = await userHelpers.getCartProductList(req.session.user._id)
     let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
    console.log(products, totalCost,couponApplied)
    
    
    if(!couponApplied){
        couponApplied={couponData: {         
            _id:null,   
            couponData: null,          
                offerPercentage: null,
                offerCap: null
               
              }}
              totalCost = await userHelpers.getTotalAmount(req.session.user._id)
              totalCost=totalValue[0].total
    }
    

    userHelpers.placeOrder(req.body, products,totalCost,totalValue,couponApplied).then((response) => {
        let orderId = response.insertedId
        insertedIds = response.insertedId
        let totalPrice = totalCost

        if (req.body['paymentMethod'] == 'COD') {
            response.cod = true; // to check whether is cod order is placed or not
            res.json(response)
        } else if (req.body['paymentMethod'] === 'RAZORPAY') {
            userHelpers.generateRazorPay(orderId, totalPrice).then((response) => {
                console.log(response)
                response.razorPay = true;
                res.json(response)
                console.log(response, "place order after raor pay")

            })
        } else if (req.body["paymentMethod"] == "PAYPAL") {
            console.log(totalCost, orderId);
            userHelpers.test(totalCost).then((data) => { // converting inr to usd
                convertedRate = data;
                console.log(convertedRate, 'converted rate')

                userHelpers.generatePayPal(orderId.toString(), convertedRate).then((response) => {
                    console.log('reached at pay pal user js stp....3');
                    console.log(response);
                    response.insertedId = orderId
                    response.payPal = true;
                    res.json(response);

                });
            })

        } else {
            console.log('something happened to error ');
        }


    })
    couponApplied=null
})


// delete one product from cart
router.post('/deleteOneCarProduct', (req, res) => {

    userHelpers.deleteOneCarProduct(req.body).then((response) => {})
})

// order history
router.get('/orderHistory', verifyLoggedIn, (req, res) => {
  
    userHelpers.orderHistory(user._id).then(async(orderHistoryData) => {
        res.render('user/orderHistory', {user, orderHistoryData,categoryData:await k()})

    })

})

// view more order details from order history

router.get('/viewOrderDetails/:id', (req, res) => {
 
    userHelpers.viewOrderDetails(req.params.id).then(async(singleOrderData) => {
        res.render('user/singleOrderView', {user, singleOrderData,categoryData:await k()})
        
    })

})
// succes after pay pal


router.get('/success', async(req, res) => {
   await userHelpers.changePaymentStatus(insertedIds).then(() =>{ 
    userHelpers.deleteCartItems(req.session.user._id) 
    userHelpers.viewOrderDetails(insertedIds).then(async(singleOrderData) => {
        res.render('user/orderPlacementSuccess', {user, singleOrderData,categoryData:await k()})

   })

    })
})


// order plcaement successfull page
router.get('/orderPlacementSuccess/:id', (req, res) => {
    userHelpers.deleteCartItems(req.session.user._id)                     // in this function product deleted from cart 
    userHelpers.viewOrderDetails(req.params.id).then(async(singleOrderData) => {
        // console.log(singleOrderData.orderData[0].deliveryDetails.name, 'totoal amounrt');
        res.render('user/orderPlacementSuccess', {user, singleOrderData,categoryData:await k()})                

    })

})

              
router.post('/verifyPayments', (req, res) => {
    console.log(req.body, 'reached at verify payment')
    userHelpers.verifyPayment(req.body).then(() => {
        console.log('verify payment completed'),
        console.log(req.body, 'req.bosy')
        userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {

            let response = {};
            response.status = true
            response.insertedId = insertedIds
            res.json(response)
        }).catch((err) => {
            console.log(err)
            res.json({status: false})
        })

    })


})


router.get('/test', (req, res) => {
    userHelpers.test(2000).then((data) => {
        console.log(data, 'data at user tesst router')

    })
    res.render('user/test')
})


module.exports = router;
