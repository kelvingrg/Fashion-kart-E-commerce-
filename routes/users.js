var express = require("express");
const adminHelpers = require("../helpers/adminHelpers");
const productHelpers = require("../helpers/productHelpers");          
var router = express.Router();
var userHelpers = require("../helpers/userHelpers");
require('dotenv').config()
const paypal = require("paypal-rest-sdk");





const client = require('twilio')("AC6b7b6ce68eb697d1f3929f14a77462bb", "b5ebfa375e271ee4451a7360c6c31c48");

let k=(async()=>{
let c=await userHelpers.getCatagory()
return c
})


    


let user;
let otp = false;
let insertedIds = null // last placed order id
let convertedRate = 0
let totalCost
let couponApplied
let totalmrp=0
let limit=2
// middle ware to check the session
verifyLoggedIn = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
};

/* GET users listing. */
router.get("/", async function async(req, res, next) {
  try{
    user = req.session.user;
    if (req.session.loggedIn) {
        let cartItemsCount = await userHelpers.getCartItemsCount(req.session.user._id)
        user.cartCount = cartItemsCount
      let  getProductDataHome= await adminHelpers.getProductDataHome()
    
        adminHelpers.getBannerOne().then(async(bannerData) => {
        res.render("index", {user, bannerData,getProductDataHome,categoryData:await k()});

        })

    } else {
        let  getProductDataHome= await adminHelpers.getProductDataHome()
 
      
        adminHelpers.getBannerOne().then(async(bannerData) => {
            res.render("index", {bannerData,getProductDataHome,categoryData:await k()});
            
        })
    }}
    catch{
        res.redirect('/errorPage')
    }

});      
router.get("/login", async(req, res) => {
    try{
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
    }}
    catch{
        res.redirect('/errorPage')
    }
});

router.post("/login", (req, res) => {
    try{
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
    })
    }
    catch{
        res.redirect('/errorPage')
    }
});

router.post("/signup", (req, res) => {
    try{
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
            userHelpers.doSignup(req.body).then(async(response) => {
            let userData= await userHelpers.statusUpdate(req.body,response);
            console.log(userData,"userData at kelvin george ");
            req.session.user=userData
            req.session.loggedIn = true;
            user=userData
                res.redirect("/");
            });
        }
    })}
    catch{
        res.redirect('/errorPage')
    }
});

router.get("/logout", (req, res) => {
    try{
    req.session.loggedIn = false;

    user = null;
    req.session.destroy();

    res.redirect("/");
    }
    catch{
        res.redirect('/errorPage')
    }
});

// single Product
router.get("/singleProduct/:id", verifyLoggedIn, async function (req, res, next) {
    
    let cartItemsCount = await userHelpers.getCartItemsCount(req.session.user._id)
    user.cartCount = cartItemsCount
    if (req.session.loggedIn) {
        productHelpers.getProduct(req.params.id).then(async(productData) => {
          
   
            res.render("user/singleProduct", {user, productData,categoryData:await k()});
           
        });
    } else 
        res.redirect("/login")


});
// product view 
// router.get("/productsVeiw", async(req, res) => {
//     let cartItemsCount = await userHelpers.getCartItemsCount(req.session.user._id)
//     user.cartCount = cartItemsCount
//         productHelpers.getProducts().then(async(productsData) => {
//             res.render("user/productsView", {user, productsData,categoryData:await k()});
//         });
   
//         res.redirect("/login");
    

// });
router.get("/productsVeiwSubCata/:subcata", async(req, res) => {
    try{

        await productHelpers.getProducts(req.params.subcata).then(async(productsData) => {
  
            res.render("user/productsView", {user, productsData,categoryData:await k()});
      
        });
    }
    catch{
        res.redirect('/errorPage')
    }  
});
//
router.get("/productsVeiwSubCata", async(req, res) => {
    try{
    await productHelpers.getProducts(req.query.subcata,req.query.pageno,limit).then(async(productsData) => {

        res.render("user/productsView", {user, productsData,categoryData:await k()});
        
    });
 }
  catch{
        res.redirect('/errorPage')
    }
});


// get product details of main catagory 
router.get("/productsVeiwMainCata/:maincata", async(req, res) => {
    try{
         await productHelpers.productsVeiwMainCata(req.params.maincata).then(async(productsData) => {
             res.render("user/productsView", {user, productsData,categoryData:await k()});
             console.log(productsData.pageNos,"catagory:maincata")
         });
        }
        catch{
              res.redirect('/errorPage')
          }  
 });
 



 router.get("/productsVeiwMainCata", async(req, res) => {
    try{
    await productHelpers.productsVeiwMainCata(req.query.maincata,req.query.pageno,limit).then(async(productsData) => {
  res.render("user/productsView", {user, productsData,categoryData:await k()});
    });
}
catch{
      res.redirect('/errorPage')
  }
    
});



// otp login
router.get("/loginWithOtp", async(req, res) => {
    try{
    if (req.session.loggedIn) {
        productHelpers.getProducts().then((productsData) => {
            res.redirect("/");
        });
    } else 
        res.render("user/loginWithOtp", {otp,categoryData:await k()});
     otp = false;
    }
    catch{
          res.redirect('/errorPage')
      }
});

// otp enter mobile number

router.post("/mobileNumber", (req, res) => {
    try{
    userHelpers.doMobileNumber(req.body).then(async(number) => {
        if (number) {
            client.verify.services("VA385192afb6828f7985b3bb7c66d9320b").verifications.create({
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
}
catch{
      res.redirect('/errorPage')
  }
});
router.post("/otpLogin", (req, res) => {
    try{
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
}
catch{
      res.redirect('/errorPage')
  }
});
// mhy account
router.get("/myAccount",verifyLoggedIn, (req, res) => {
    try{
    if (req.session.loggedIn) {
        userHelpers.doGetUser(user).then(async(reuser) => {
            req.session.user = reuser;
            let cartCount=user.cartCount
            user = reuser;
user.cartCount=cartCount
            res.render("user/myAccount", {user,categoryData:await k()});
        });
    } else {
        res.redirect("/login");
    }
}
catch{
      res.redirect('/errorPage')
  }
});
// password reset
router.post("/passwordReset", verifyLoggedIn, (req, res) => {
    try{
    userHelpers.updatePassword(req.body, user).then((response) => {
        console.log(response.updatepass);
        res.json(response);
    });
}
catch{
      res.redirect('/errorPage')
  }
});

// personal Update

router.post("/personalDataUpdate",verifyLoggedIn, (req, res) => {
    try{
    userHelpers.updatePersonalData(req.body, user).then((response) => {
        respone = 'hai'
        res.json(response);
    });
}
catch{
      res.redirect('/errorPage')
  }
});

// add to cart

router.get("/addToCart/:id", verifyLoggedIn, (req, res) => {
    try{
    userHelpers.addToCart(req.params.id, req.session.user._id).then((response) => {
    res.json({status: true})
    })     
}
catch{
      res.redirect('/errorPage')
  }     
})
// cart Page
router.get("/cartPage", verifyLoggedIn, async (req, res) => {
    try{
    let cartItemsCount = await userHelpers.getCartItemsCount(req.session.user._id)
        user.cartCount = cartItemsCount
        if(user.cartCount===0){
            user.productAvailable=false
        }
        else{
            user.productAvailable=true
        }
    let cartProducts = await userHelpers.getCartProducts(req.session.user._id)
    let totalCost = await userHelpers.getTotalAmount(req.session.user._id)
    res.render("user/cart", {cartProducts, user, totalCost,categoryData:await k()})
}
catch{
      res.redirect('/errorPage')
  }
})


// increment or decrement of cart items count
router.post('/changeProductQuantity',verifyLoggedIn, (req, res, next) => {
    try{
    userHelpers.changeProductQuantity(req.body).then(async (response) => {
        response.total = await userHelpers.getTotalAmount(req.body.user)
        res.json(response)

    })
}
catch{
      res.redirect('/errorPage')
  }
})
// check out page

router.get("/checkOut",verifyLoggedIn, async (req, res, next) => {
    try{
   let addressData= await userHelpers.getAddress(req.session.user._id)
    let totalCost = await userHelpers.getTotalAmount(req.session.user._id)
    let cartItemsCount = await userHelpers.getCartItemsCount(req.session.user._id)
  if(cartItemsCount==0){
res.redirect('/cartPage')
  }
  else
 
  
        user.cartCount = cartItemsCount
    res.render('user/checkOut', {user, totalCost,categoryData:await k(),addressData})
}
catch{
      res.redirect('/errorPage')
  }
})

// coupon code check 
router.post('/couponCodeCheck',verifyLoggedIn,async(req,res)=>{
    try{
  let couponData= await userHelpers.validateCoupon(req.body,req.session.user._id) 
  couponApplied={...couponData}// declaring this data to globally , to save the coupon applied details on order and user db 
   let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
  totalCost=totalValue[0].total
   totalmrp=totalValue[0].mrp
  console.log(couponData,totalCost)
  if(couponData.couponData){
    let finalAmount,offerAmountAvailable 
   let offerAmountActual=totalCost/100*couponData.couponData.offerPercentage
  
    if(offerAmountActual>couponData.couponData.offerCap)
    {
      finalAmount=totalCost-couponData.couponData.offerCap         
     offerAmountAvailable=couponData.couponData.offerCap
     couponApplied.offerAmountAvailable=couponData.couponData.offerCap
    }
   else{         
   finalAmount=totalCost-offerAmountActual               
    offerAmountAvailable=offerAmountActual
    couponApplied.offerAmountAvailable=offerAmountActual
      }          
      res.json({finalAmount,offerAmountAvailable})
      totalCost=finalAmount                                  // declaring globally to get this value while order placing  
    }
    else{
        
          couponApplied={couponData: {         
            _id:null,   
            couponData: null,          
                offerPercentage: null,
                offerCap: null,
               
              }}
              couponApplied.offerAmountAvailable=0
        res.json(couponData)
    }
}
catch{
      res.redirect('/errorPage')
  }
})
// routeer to set coupon code as null with each refresh 
router.post('/couponAppliedSetNull',verifyLoggedIn,(req,res)=>{
    couponApplied=null
})




// place order post
router.post('/placeOrder',verifyLoggedIn, async (req, res) => {
    try{
 let products = await userHelpers.getCartProductList(req.session.user._id)
     let totalValue = await userHelpers.getTotalAmount(req.session.user._id)

    if(!couponApplied){
        couponApplied={couponData: {         
            _id:null,   
            couponData: null,          
                offerPercentage: null,
                offerCap: null,
               
               
              }}
            ;
            couponApplied.offerAmountAvailable=0
              totalCost = await userHelpers.getTotalAmount(req.session.user._id)
              totalCost=totalValue[0].total
             totalmrp=totalValue[0].mrp
    }
   
    userHelpers.placeOrder(req.body, products,totalCost,totalValue,totalmrp,couponApplied).then((response) => {
        
        let orderId = response.insertedId   
        insertedIds = response.insertedId
        let totalPrice =Math.round(totalCost) 

        if (req.body['paymentMethod'] == 'COD') {
            response.cod = true; // to check whether is cod order is placed or not
            res.json(response)
        }else if (req.body['paymentMethod'] === 'WALLET'){
            if(user.wallet>totalCost){
            userHelpers.buyWithWallet(req.session.user._id,-totalCost,insertedIds).then(()=>{
                response.wallet = true;
                res.json(response)
            })
        }
            else
           { 
            response.insufficientWallet=true
            userHelpers.deletePendingOrder(insertedIds).then(()=>{
             
                res.json(response)
            })
            
        }
        }        
        
        else if (req.body['paymentMethod'] === 'RAZORPAY') {
            userHelpers.generateRazorPay(orderId, totalPrice).then((response) => {
                response.razorPay = true;
                res.json(response)
            

            })
        } else if (req.body["paymentMethod"] == "PAYPAL") {
          
            userHelpers.conertRate(totalCost).then((data) => { // converting inr to usd
                convertedRate =Math.round(data) 
              

                userHelpers.generatePayPal(orderId.toString(), convertedRate).then((response) => {
                  
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
}
catch{
      res.redirect('/errorPage')
  }
})


// delete one product from cart
router.post('/deleteOneCarProduct',verifyLoggedIn, (req, res) => {        
    try{
    userHelpers.deleteOneCarProduct(req.body).then((response) => {
        res.json(response)
    })
}
catch{
      res.redirect('/errorPage')
  }
})

// order history
router.get('/orderHistory', verifyLoggedIn, (req, res) => {
    try{
    userHelpers.orderHistory(user._id).then(async(orderHistoryData) => {
        orderHistoryData.reverse()
        res.render('user/orderHistory', {user, orderHistoryData,categoryData:await k()})
 })
}
catch{
      res.redirect('/errorPage')
  }
})

// view more order details from order history

router.get('/viewOrderDetails/:id',verifyLoggedIn, (req, res) => {
    try{
    userHelpers.viewOrderDetails(req.params.id).then(async(singleOrderData) => {
        console.log(singleOrderData);
         if(singleOrderData.orderData[0].status=="Delivered")
            singleOrderData.orderData[0].delivered=true
            else
            singleOrderData.orderData[0].delivered=false


         
        res.render('user/singleOrderView', {user, singleOrderData,categoryData:await k()})
        
    })
}
catch{
      res.redirect('/errorPage')
  }
})
// succes after pay pal


router.get('/success',verifyLoggedIn, async(req, res) => {
    try{
    let cartItemsCount = await userHelpers.getCartItemsCount(req.session.user._id)
        user.cartCount = cartItemsCount
   await userHelpers.changePaymentStatus(insertedIds).then(() =>{ 
    userHelpers.deleteCartItems(req.session.user._id) 
    userHelpers.viewOrderDetails(insertedIds).then(async(singleOrderData) => {
        res.render('user/orderPlacementSuccess', {user, singleOrderData,categoryData:await k()})

   })
    })
}
catch{
      res.redirect('/errorPage')
  }
})


// order plcaement successfull page
router.get('/orderPlacementSuccess/:id',verifyLoggedIn, async(req, res) => {
    try{
    let cartItemsCount = await userHelpers.getCartItemsCount(req.session.user._id)
        user.cartCount = cartItemsCount
    userHelpers.deleteCartItems(req.session.user._id)                     // in this function product deleted from cart 
    userHelpers.viewOrderDetails(req.params.id).then(async(singleOrderData) => {
        // console.log(singleOrderData.orderData[0].deliveryDetails.name, 'totoal amounrt');
        res.render('user/orderPlacementSuccess', {user, singleOrderData,categoryData:await k()})                

    })
}
catch{
      res.redirect('/errorPage')
  }
})

              
router.post('/verifyPayments',verifyLoggedIn, (req, res) => {
    try{
    userHelpers.verifyPayment(req.body).then(() => {
       
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

}
catch{
      res.redirect('/errorPage')
  }
})



router.post('/addNewAddress',verifyLoggedIn,async(req,res)=>{
    try{
     await userHelpers.addNewAddress(req.body,req.session.user._id)
    console.log(req.body)
    res.redirect('/myaccount')
}
catch{
      res.redirect('/errorPage')
  }
})                
router.get('/viewSavedAddresses',verifyLoggedIn,async(req,res)=>{
    try{
       userHelpers.getAddress(req.session.user._id).then(async(addressData)=>{
        res.render('user/viewSavedAddresses',{user,categoryData:await k(),addressData})
       })
    }
    catch{
          res.redirect('/errorPage')
      }   
    
})
router.post('/updateNewAdressFromCheckOut',verifyLoggedIn,async(req,res)=>{
    try{
    await userHelpers.addNewAddress(req.body,req.session.user._id)
    res.redirect("/checkOut")
}
catch{
      res.redirect('/errorPage')
  }
})

// cancel order from userSide
router.post('/cancelOrder',verifyLoggedIn,(req,res)=>{
    try{
    adminHelpers.cancelOrder(req.body).then((response)=>{
        res.json(response)
    })
}
catch{
      res.redirect('/errorPage')
  }
})
router.post('/returnOrder',(req,res)=>{
    try{
    userHelpers.returnOrder(req.body).then((response)=>{
        res.json(response)
    })
}
catch{
      res.redirect('/errorPage')
  }
})

router.get('/deleteAddress/:id',verifyLoggedIn,(req,res)=>{
    try{
    userHelpers.deleteAddress(req.session.user._id,req.params.id).then((response)=>{
        res.json(response)
    })
}
catch{
      res.redirect('/errorPage')
  }
})                      
router.get('/invoice/:orderId',verifyLoggedIn,async(req,res)=>{
    try{
  let orderData= await userHelpers.generateInvoice(req.params.orderId)
  orderData[0].timeStamp=orderData[0].timeStamp.toLocaleDateString()
    res.render('user/invoice',{user,categoryData:await k(),orderData})
}
catch{
      res.redirect('/errorPage')
  }
})
router.get('/allProducts',(req,res)=>{
    try{
    if(req.query)
{
    productHelpers.allProducts(req.query.pageno,limit).then(async(productsData)=>{
        res.render('user/productsView', {user, productsData,categoryData:await k()})
    })
}  else{
    productHelpers.allProducts().then(async(productsData)=>{
        res.render('user/productsView', {user, productsData,categoryData:await k()})
    })
}
}
catch{
      res.redirect('/errorPage')
  }
 })     

router.get('/errorPage',async(req,res)=>{
    try{
    res.render('user/errorPage',{user,categoryData:await k()})
}
catch{
      res.redirect('/errorPage')
  }
})

router.get('/walletHistory/:userId',async(req,res)=>{
let wallet =await userHelpers.walletHistory(req.params.userId)
    res.render('user/walletHistory',{user,wallet,categoryData:await k()})


})



module.exports = router;       
                              