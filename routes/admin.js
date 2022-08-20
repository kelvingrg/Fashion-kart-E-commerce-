
var express = require("express");
var router = express.Router();
var adminHelpers = require("../helpers/adminHelpers");
var userHelpers = require("../helpers/userHelpers");
var productHelpers = require("../helpers/productHelpers");
const multer = require("multer");
const moment = require("moment");
let detailedOrder

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./images");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname);
    }
});
const upload = multer({storage: fileStorageEngine});

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
            logerr: req.session.logerr
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

router.get("/dashbord",verifyLoggedIn, (req, res) => {
    res.render("admin/index", {admin: true});
});

router.get("/logout", (req, res) => {
    req.session.admin = false;

    req.session.destroy();
    res.redirect("/admin/");
});

router.get("/userDetails", verifyLoggedIn, (req, res) => {
    adminHelpers.getAllUsers().then((user) => {
        res.render("admin/userDetails", {
            admin: true,
            user
        });
    });
});

router.get("/addUser", verifyLoggedIn, (req, res) => {
    res.render("admin/addUser", {
        admin: true,
        emailerr: req.session.emailerr,
        phoneerr: req.session.phoneerr
    });
    req.session.emailerr = false;
    req.session.phonerr = false;
});
router.post("/addUser", (req, res) => {
    userHelpers.userExist(req.body).then((response) => {
        if (response.phone || response.email) {
            if (response.phone) {
                req.session.phoneerr = true;
            }
            if (response.email) {
                req.session.emailerr = true;
            }
            res.redirect("/admin/addUser");
        }

        if (response.noexist) {
            adminHelpers.addUser(req.body).then((respone) => {
                userHelpers.statusUpdate(req.body);
                res.redirect("/admin/userDetails");
            });
        }
    });
});
router.get("/updateUser/:id", verifyLoggedIn, (req, res) => {
    adminHelpers.getUser(req.params.id).then((userData) => {
        res.render("admin/updateUser", {
            admin: true,
            userData,
            logerr: false,
            emailerr: false
        });
    });
});
router.post("/updateUser/:id", (req, res) => {
    adminHelpers.updateUser(req.params.id, req.body).then((respone) => {
        res.redirect("/admin/userDetails");
    });
});

router.get("/productDetails", verifyLoggedIn, (req, res) => {
    productHelpers.getProducts().then((productData) => {
        res.render("admin/ProductDetails", {
            admin: true,
            productData
        });
    });
});

router.get("/addProduct", verifyLoggedIn, (req, res) => {
    productHelpers.getCatagory().then((catData) => {
        res.render("admin/addProduct", {
            admin: true,
            catData
        });
    })

});

router.post("/addProduct", upload.array("images", 4), (req, res) => {
    if (!req.files) {
        res.redirect("/admin/addProduct");
    }
    var filenames = req.files.map(function (file) {
        return file.filename;
    });
    req.body.images = filenames;

    productHelpers.addProduct(req.body).then((response) => {
        res.redirect("/admin/productDetails");
    });
});

router.get("/updateProduct/:id", verifyLoggedIn, (req, res) => {
    productHelpers.getProduct(req.params.id).then((productData) => {
        console.log(productData);
        res.render("admin/updateProduct", {
            admin: true,
            productData
        });
    });
});
router.post("/updateProduct/:id", upload.array("images", 4), (req, res) => {
    if (!req.files) {
        productHelpers.getProduct(req.params.id).then((productData) => {
            res.render("admin/updateProduct", {
                admin: true,
                productData
            });
        });
    } else {
        var filenames = req.files.map(function (file) {
            return file.filename;
        });
        req.body.images = filenames;
        productHelpers.updateProduct(req.params.id, req.body).then((resolve) => {
            res.redirect("/admin/productDetails");
        });
    }
});
// delete product 
router.get("/deleteProduct/:id", verifyLoggedIn, (req, res) => {
    productHelpers.deleteProduct(req.params.id).then((response) => {
        res.redirect("/admin/productDetails");
    });
});
// delete user 
router.get("/deleteUser/:id", verifyLoggedIn, (req, res) => {
    userHelpers.deleteUser(req.params.id).then((response) => {
        res.redirect("/admin/userDetails");
    });
});
// ban user
router.get("/banUser/:id", verifyLoggedIn, (req, res) => {
    userHelpers.banUser(req.params.id).then((response) => {
        res.redirect("/admin/userDetails");
    });
});
router.get("/unbanUser/:id", verifyLoggedIn, (req, res) => {
    userHelpers.unbanUser(req.params.id).then((response) => {
        res.redirect("/admin/userDetails");
    });
});

// add catagory
router.get("/addCatagory", verifyLoggedIn, (req, res) => {

 productHelpers.getCatagory().then((cataData)=>{

    console.log('catagory data at admin js,',cataData)
    res.render("admin/addCatagory", {admin: true,cataData});
 })
})
 // delete catagory 
 router.post("/deleteCatagory",(req,res)=>{
    console.log(req.body)
    productHelpers.deleteCatagory(req.body).then((response)=>{
        console.log(response)
        res.json(response)

    })
})
// delete catagory with listed products deleteCatagoryWithProd

router.post("/deleteCatagoryWithProd",(req,res)=>{
    console.log(req.body)
    productHelpers.deleteCatagoryWithProd(req.body).then((response)=>{
        console.log(response)
        res.json(response)
    })    
});
router.post("/addCatagory", (req, res) => {
    productHelpers.addCatagory(req.body).then((response) => {
        res.redirect("/admin/addCatagory");
    })
    
});
// get subcatagory
router.post('/getSubCatagory', (req, res) => {
    console.log(req.body);
    productHelpers.getSubCatagory(req.body).then((response) => {
        console.log(response.length)
        res.json(response);

    })
})
// get catagory
router.post('/getCatagory', (req, res) => {
    res.send('hai')
    console.log('req.body');
    productHelpers.getSubCatagory(req.body).then((response) => {
        console.log(response.length)
        console.log(response)

        res.json(response);

    })

})
// banners
router.get("/banners", verifyLoggedIn, (req, res) => { // add verify logged in
    adminHelpers.getBanner().then((bannerData) => {
        console.log(bannerData)
        res.render("admin/newBanner", {
            admin: true,
            bannerData
        });
    })


});
// add banners
router.post("/addBanners", upload.array("images", 4), (req, res) => {
    if (!req.files) {
        res.redirect("/admin/banners");
    }
    var filenames = req.files.map(function (file) {
        return file.filename;
    });
    req.body.images = filenames;

    adminHelpers.addBanner(req.body).then((response) => {
        console.log(response)
        res.redirect("/admin");
    });
});
// order details
router.get('/orderDetails', (req, res) => { // nned veriifylgoin
    adminHelpers.getOrderDetails().then((orderDetails) => {
        if (orderDetails.status != 'cancelled') {
            orderDetails.cancel == true
        } else {
            orderDetails.cancel = false
        }
        res.render('admin/orderDetails', {
            admin: true,
            orderDetails
        })
    })

})

// get all order details

router.post('/orderDepthDetails', (req, res) => {
    adminHelpers.getAllOrderDetails(req.body.orderId, req.body.userId).then((response) => {


        detailedOrder = {
            ...response
        }

        res.json(response)
    })


})
// get order details 
router.get('/viewMoreOrderDetails', (req, res) => {
    res.render('admin/viewMoreOrderDetails', {
        admin: true,
        detailedOrder
    })
})

//cancel order 

router.post('/cancelOrder', (req, res) => {
    console.log(req.body);
    adminHelpers.cancelOrder(req.body).then((response) => {
        console.log(response)
        res.json(response)
    })

})

// order status update 
router.post('/orderStatusUpdate', (req, res) => {
    console.log(req.body,'+++++++++++++++++++++++++++++++++');
    adminHelpers.orderStatusUpdate(req.body.orderId,req.body.status).then((response) => {
        console.log(response)
        res.json(response)
    })

})

// load line chart data 
router.post('/getLineChartData',(req,res)=>{
    console.log(req.body,'linedata.........2');
    adminHelpers.getLineChartData(req.body).then((response)=>{
        console.log('line data ......4')
    })
})
//get total revenue 
router.post('/getRevenueData',(req,res)=>{
    adminHelpers.getRevenueData(req.body.day).then((response)=>{
        res.json(response)
    })
})
// get new users data 
router.post('/newUsersData',(req,res)=>{
    adminHelpers.newUsersData(req.body.day).then((response)=>{
        res.json(response)
    })
})
// get cancelled order data getCancelledOrderData
router.post('/getCancelledOrderData',(req,res)=>{
    console.log(req.body.day,'++++++++++++++++++++++++++++')
    adminHelpers.getCancelledOrderData(req.body.day).then((response)=>{
        res.json(response)
    })
})
// order count orderCount
router.post('/orderCount',(req,res)=>{
    console.log(req.body.day,'++++++++++++++++++++++++++++')
    adminHelpers.orderCount(req.body.day).then((response)=>{
        console.log(response)
        res.json(response)
    })
})
router.post('/test',async(req,res)=>{

let resp= await adminHelpers.test()
        console.log(resp,'adminroutes test')
res.json(resp)
    
})

//dotNutChartData
//
router.post('/loadDonutChart',async(req,res)=>{

   let data= await adminHelpers.dotNutChartData()
   console.log('response.djhxcn',data)
     res.json(data)
   
})
// edit catagory 
router.get('/editCatagory/:id', (req, res) => {                 // ned vrifyloggedin 
       adminHelpers.getOneCatagory(req.params.id).then((oneCataData)=>{
        res.render('admin/editCatagory', {admin: true,oneCataData})
       })                    
})

// edit sub catagory updateSubCata
router.post('/updateSubCata',async(req,res)=>{
 let data= await productHelpers.updateSubCata(req.body)
      res.json(data)
})
// coupon management page 
router.get('/couponMangement',(req,res)=>{

    adminHelpers.getCouponCodes().then((couponData)=>{
        console.log('reached at couponMangement routesz after admin helpers',couponData);
        couponData.map((data)=>{
            console.log(data.startDate,'dta---------------')
            data.startDate=data.startDate.toDateString()
            data.endDate= data.endDate.toDateString()
        })
       

        console.log(couponData)
        res.render('admin/couponMangement',{admin:true,couponData})
    })
   
})
//add coupon code 
router.post('/addCouponCode',async(req,res)=>{
    req.body.offerPercentage=parseInt(req.body.offerPercentage)
    req.body.offerCap=parseInt(req.body.offerCap)
      await adminHelpers.addCouponCode(req.body)
        console.log('reached back at  coupon routes ')
       res.redirect('/admin/couponMangement')
   })

module.exports = router;
