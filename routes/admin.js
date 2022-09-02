
var express = require("express");
var router = express.Router();
var adminHelpers = require("../helpers/adminHelpers");
var userHelpers = require("../helpers/userHelpers");
var productHelpers = require("../helpers/productHelpers");
const multer = require("multer");
const moment = require("moment");
const { response } = require("express");


let detailedOrder
let year


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

router.get("/", async function (req, res, next) {
    try{
    if (req.session.admin) {
        res.redirect("/admin/dashbord");
    } else {
         year= await adminHelpers.fetchYears()
     
        res.render("admin/loginPage", {
            adminlogin: true,
            logerr: req.session.logerr,
        
        });
        req.session.logerr = false;
    }
}
catch{
      res.redirect('/admin/errorPage')
  }
});
router.post("/login", (req, res) => {
    try{
    if (req.body.email === admin.email && req.body.password === admin.password) {
        req.session.admin = true;
        res.redirect("/admin/dashbord");
        // res.redirect('/dashbord')
    } else {
        req.session.logerr = true;
        res.redirect("/admin/");
    }
}
catch{
      res.redirect('/admin/errorPage')
  }
});

router.get("/dashbord",verifyLoggedIn, async(req, res) => {
    try{
    let reportData= await adminHelpers.getReportData()
    res.render("admin/index", {admin: true,year,reportData});
}
catch{
      res.redirect('/admin/errorPage')
  }
});

router.get("/logout", (req, res) => {
    try{
    req.session.admin = false;
 req.session.destroy();
    res.redirect("/admin/");
}
catch{
      res.redirect('/admin/errorPage')
  }
});

router.get("/userDetails", verifyLoggedIn, (req, res) => {
    try{
    adminHelpers.getAllUsers().then((user) => {
        res.render("admin/userDetails", {
            admin: true,
            user
        });
    });
}
catch{
      res.redirect('/admin/errorPage')
  }
});

router.get("/addUser", verifyLoggedIn, (req, res) => {    try{
    res.render("admin/addUser", {
        admin: true,
        emailerr: req.session.emailerr,
        phoneerr: req.session.phoneerr
    });
    req.session.emailerr = false;
    req.session.phonerr = false;
}
catch{
      res.redirect('/admin/errorPage')
  }
});
router.post("/addUser", (req, res) => {
    try{
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
}
catch{
      res.redirect('/admin/errorPage')
  }
});
router.get("/updateUser/:id", verifyLoggedIn, (req, res) => {
    try{
    adminHelpers.getUser(req.params.id).then((userData) => {
        res.render("admin/updateUser", {
            admin: true,
            userData,
            logerr: false,
            emailerr: false,
            year
        });
    });
}
catch{
      res.redirect('/admin/errorPage')
  }
});
router.post("/updateUser/:id",verifyLoggedIn, (req, res) => {
    try{
    adminHelpers.updateUser(req.params.id, req.body).then((respone) => {
        res.redirect("/admin/userDetails");
    });
}
catch{
      res.redirect('/admin/errorPage')
  }
});

router.get("/productDetails", verifyLoggedIn, (req, res) => {
    try{
    productHelpers.getProductss().then((productData) => {
        res.render("admin/ProductDetails", {
           
            admin: true,
            productData,year
        });
    });
}
catch{
      res.redirect('/admin/errorPage')
  }
});

router.get("/addProduct", verifyLoggedIn, (req, res) => {
    try{
    productHelpers.getCatagory().then((catData) => {
        res.render("admin/addProduct", {
            admin: true,
            catData,year
        });
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
});

router.post("/addProduct",verifyLoggedIn, upload.array("images", 4), (req, res) => {
    try{
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
}
catch{
      res.redirect('/admin/errorPage')
  }
});

router.get("/updateProduct/:id", verifyLoggedIn, (req, res) => {
    try{
    productHelpers.getProduct(req.params.id).then((productData) => {
        console.log(productData);
        res.render("admin/updateProduct", {
            admin: true,
            productData,year
        });
    });
}
catch{
      res.redirect('/admin/errorPage')
  }
});
router.post("/updateProduct/:id",verifyLoggedIn, upload.array("images", 4), (req, res) => {
    try{
    if (!req.files) {
        productHelpers.getProduct(req.params.id).then((productData) => {
            res.render("admin/updateProduct", {
                admin: true,
                productData,year
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
}
catch{
      res.redirect('/admin/errorPage')
  }
});
// delete product 
router.get("/deleteProduct/:id", verifyLoggedIn, (req, res) => {
    try{
    productHelpers.deleteProduct(req.params.id).then((response) => {
        res.redirect("/admin/productDetails");
    });
}
catch{
      res.redirect('/admin/errorPage')
  }
});
// delete user 
router.get("/deleteUser/:id", verifyLoggedIn, (req, res) => {
    try{
    userHelpers.deleteUser(req.params.id).then((response) => {
        res.redirect("/admin/userDetails");
    });
}
catch{
      res.redirect('/admin/errorPage')
  }
});
// ban user
router.get("/banUser/:id", verifyLoggedIn, (req, res) => {
    try{
    userHelpers.banUser(req.params.id).then((response) => {
        res.redirect("/admin/userDetails");
    });
}
catch{
      res.redirect('/admin/errorPage')
  }
});
router.get("/unbanUser/:id", verifyLoggedIn, (req, res) => {
    try{
    userHelpers.unbanUser(req.params.id).then((response) => {
        res.redirect("/admin/userDetails");
    });
}
        catch{
              res.redirect('/admin/errorPage')
          }
});

// add catagory
router.get("/addCatagory", verifyLoggedIn, (req, res) => {
    try{
 productHelpers.getCatagory().then((cataData)=>{
    res.render("admin/addCatagory", {admin: true,cataData});
 })
}
catch{
      res.redirect('/admin/errorPage')
  }
})
 // delete catagory 
 router.post("/deleteCatagory",verifyLoggedIn,(req,res)=>{
    try{
    productHelpers.deleteCatagory(req.body).then((response)=>{
   res.json(response)

    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})
// delete catagory with listed products deleteCatagoryWithProd

router.post("/deleteCatagoryWithProd",verifyLoggedIn,(req,res)=>{
    try{
    productHelpers.deleteCatagoryWithProd(req.body).then((response)=>{
res.json(response)
    })   
}
catch{
      res.redirect('/admin/errorPage')
  } 
});
router.post("/addCatagory", (req, res) => {
    try{
    productHelpers.addCatagory(req.body).then((response) => {
        res.redirect("/admin/addCatagory");
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
});
// get subcatagory
router.post('/getSubCatagory', (req, res) => {
    try{
    productHelpers.getSubCatagory(req.body).then((response) => {
     res.json(response);

    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})
// get catagory
router.post('/getCatagory',verifyLoggedIn, (req, res) => {
    try{
    productHelpers.getSubCatagory(req.body).then((response) => {
 res.json(response);

    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})
// banners
router.get("/banners", verifyLoggedIn, (req, res) => { // add verify logged in
    try{
    adminHelpers.getBanner().then((bannerData) => {

        res.render("admin/newBanner", {
            admin: true,
            bannerData
        });
        
    })

}
catch{
      res.redirect('/admin/errorPage')
  }
});
// add banners
router.post("/addBanners", verifyLoggedIn,upload.array("images", 4), (req, res) => {
    try{
    if (!req.files) {
        res.redirect("/admin/banners");
    }
    var filenames = req.files.map(function (file) {
        return file.filename;
    });
    req.body.images = filenames;

    adminHelpers.addBanner(req.body).then((response) => {
        console.log(response)
        res.redirect("/admin/banners");
    });
}
catch{
      res.redirect('/admin/errorPage')
  }
});
// order details
router.get('/orderDetails',verifyLoggedIn, (req, res) => { // nned veriifylgoin
    try{
    adminHelpers.getOrderDetails().then((orderDetails) => {
        orderDetails.map((element)=>{
            element.date= element.timeStamp.toISOString().replace(/T.*/,'').split('-').reverse().join('-')
        })
        if (orderDetails.status != 'Cancelled') {
            orderDetails.cancel == true
        } else {
            orderDetails.cancel = false
        }
        res.render('admin/orderDetails', {
            admin: true,
            orderDetails
        })
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})

// get all order details

router.post('/orderDepthDetails',verifyLoggedIn, (req, res) => {
    try{
    adminHelpers.getAllOrderDetails(req.body.orderId, req.body.userId).then((response) => {


        detailedOrder = {
            ...response
        }

        res.json(response)
    })
}
catch{
      res.redirect('/admin/errorPage')
  }

})
// get order details 
router.get('/viewMoreOrderDetails', verifyLoggedIn,(req, res) => {
    try{
    res.render('admin/viewMoreOrderDetails', {
        admin: true,
        detailedOrder
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})

//cancel order 

router.post('/cancelOrder',verifyLoggedIn, (req, res) => {
    try{
    console.log(req.body);
    adminHelpers.cancelOrder(req.body).then((response) => {
        console.log(response)
        res.json(response)
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})

// order status update 
router.post('/orderStatusUpdate',verifyLoggedIn, (req, res) => {
    try{
    adminHelpers.orderStatusUpdate(req.body.orderId,req.body.status).then((response) => {
    
        res.json(response)
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})

// load line chart data 
router.post('/getLineChartData',(req,res)=>{
    try{
    adminHelpers.getLineChartData(req.body).then((response)=>{
   
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})
//get total revenue 
router.post('/getRevenueData',(req,res)=>{
    try{
    adminHelpers.getRevenueData(req.body.day).then((response)=>{
        res.json(response)
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})
// get new users data 
router.post('/newUsersData',verifyLoggedIn,(req,res)=>{
    try{
    adminHelpers.newUsersData(req.body.day).then((response)=>{
        res.json(response)

    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})
// get cancelled order data getCancelledOrderData
router.post('/getCancelledOrderData',verifyLoggedIn,(req,res)=>{
    try{
    adminHelpers.getCancelledOrderData(req.body.day).then((response)=>{
        res.json(response)
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})
// order count orderCount
router.post('/orderCount',verifyLoggedIn,(req,res)=>{
    try{
    adminHelpers.orderCount(req.body.day).then((response)=>{
       
        res.json(response)
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})
router.post('/test',verifyLoggedIn,async(req,res)=>{
    try{
let resp= await adminHelpers.test()
res.json(resp)
}
catch{
      res.redirect('/admin/errorPage')
  }
    
})

//dotNutChartData
//
router.post('/loadDonutChart',async(req,res)=>{
    try{
   let data= await adminHelpers.dotNutChartData()
   console.log('response.djhxcn',data)
     res.json(data)
    }
    catch{
          res.redirect('/admin/errorPage')
      }
})
// edit catagory 
router.get('/editCatagory/:id',verifyLoggedIn, (req, res) => {   
    try{              // ned vrifyloggedin 
       adminHelpers.getOneCatagory(req.params.id).then((oneCataData)=>{
        res.render('admin/editCatagory', {admin: true,oneCataData})
       })  
    }
    catch{
          res.redirect('/admin/errorPage')
      }                  
})

// edit sub catagory updateSubCata
router.post('/updateSubCata',verifyLoggedIn,async(req,res)=>{
    try{
 let data= await productHelpers.updateSubCata(req.body)
      res.json(data)
    }
    catch{
          res.redirect('/admin/errorPage')
      }
})
// edit main catagory updateSubCata
router.post('/updateMainCata',verifyLoggedIn,async(req,res)=>{
    try{
    let data= await productHelpers.updateMainCata(req.body)
         res.json(data)
        }
        catch{
              res.redirect('/admin/errorPage')
          }
   })

   router.post('/updateNewSubCatagory/:cataId',verifyLoggedIn,(req,res)=>{
    try{
    console.log(req.params.cataId,"updateNewSubCatagory",req.body)
    productHelpers.updateNewSubCatagory(req.body,req.params.cataId).then(()=>{
        res.redirect('admin/addCatagory')
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
   })

// coupon management page 
router.get('/couponMangement',verifyLoggedIn,(req,res)=>{
    try{
    adminHelpers.getCouponCodes().then((couponData)=>{
        couponData.map((data)=>{
        
            data.startDate=data.startDate.toDateString()
            data.endDate= data.endDate.toDateString()
        })

        res.render('admin/couponMangement',{admin:true,couponData,year})
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})
//add coupon code 
router.post('/addCouponCode', verifyLoggedIn,async(req,res)=>{
    try{
    req.body.offerPercentage=parseInt(req.body.offerPercentage)
    req.body.offerCap=parseInt(req.body.offerCap)
      await adminHelpers.addCouponCode(req.body)
      
       res.redirect('/admin/couponMangement')
    }
    catch{
          res.redirect('/admin/errorPage')
      }
   })



// sales report 
router.get('/revenueSalesReport',verifyLoggedIn,async(req,res)=>{
    try{
  let year= await adminHelpers.fetchYears()
    await adminHelpers.fetchMonthlyData().then(async(catagory)=>{
await adminHelpers.fetchData(catagory).then((reportData)=>{
    res.render('admin/salesReport',{admin:true,reportData,year})
})

    })
}
catch{
      res.redirect('/admin/errorPage')
  }

})
router.get('/revenueSalesReport/:selectedYear',verifyLoggedIn,async(req,res)=>{
    try{
    selectedYear=req.params.selectedYear
  let year= await adminHelpers.fetchYears()
    await adminHelpers.fetchMonthlyData().then(async(catagory)=>{
await adminHelpers.fetchData(catagory,selectedYear).then((reportData)=>{
   
    res.render('admin/salesReport',{admin:true,reportData,year,selectedYear})

    
})
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})

//s
router.get('/quantitySalesReport/:selectedYear',verifyLoggedIn,async(req,res)=>{
    try{
    selectedYear=req.params.selectedYear
  let year= await adminHelpers.fetchYears()
    await adminHelpers.fetchMonthlyData().then(async(catagory)=>{
await adminHelpers.fetchData(catagory,selectedYear).then((reportData)=>{
   
    res.render('admin/quantitySalesReport',{admin:true,reportData,year,selectedYear})

    
})
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})

router.get('/combinedSalesReport/:selectedYear',verifyLoggedIn,async(req,res)=>{
    try{
    selectedYear=req.params.selectedYear
  let year= await adminHelpers.fetchYears()
    await adminHelpers.fetchMonthlyData().then(async(catagory)=>{
await adminHelpers.fetchData(catagory,selectedYear).then((reportData)=>{
   
    res.render('admin/combinedSalesReport',{admin:true,reportData,year,selectedYear})

    
})
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})

// catagoey offers 

router.get("/catagoryOfferManagement",verifyLoggedIn,(req,res)=>{
    try{
    productHelpers.getCatagory().then((cataData)=>{
        res.render("admin/catagoryOfferManagement",{admin:true,cataData})
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})
 
 // add catatgory offern

 router.post('/addCatagoryOffer',verifyLoggedIn,(req,res)=>{
    try{
    productHelpers.addCatagoryOffer(req.body).then(()=>{

    })
}
catch{
      res.redirect('/admin/errorPage')
  }
 })     
 router.post('/applyCatagoryOffer',verifyLoggedIn,async(req,res)=>{  
    try{
 let response =await adminHelpers.applyCatagoryOffer(req.body)
res.json(response)
}
catch{
      res.redirect('/admin/errorPage')
  }
 }) 
 router.post('/removeCatagoryOffer',async(req,res)=>{
    let response =await adminHelpers.removeCatagoryOffer(req.body)
 res.json(response)
 })
router.get('/approveRefund/:orderId',(req,res)=>{
    try{
    adminHelpers.approveRefund(req.params.orderId).then((response)=>{
        
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})
    
router.get('/singleCouponHistory/:couponId',verifyLoggedIn,(req,res)=>{
    try{
    adminHelpers.singleCouponHistory(req.params.couponId).then((singleCouponData)=>{
        singleCouponData.map((element)=>{
            element.couponDiscount=element.totalAmount-element.finalAmount
            element.date=element.timeStamp.toLocaleDateString()
        })
        res.render('admin/singleCouponHistory',{admin:true,year,singleCouponData})
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
})

router.get('/editSingleCoupon/:couponId',verifyLoggedIn,(req,res)=>{ 
    try{
adminHelpers.getCouponData(req.params.couponId).then((singleCouponData)=>{
    res.render('admin/editSingleCoupon',{admin:true,singleCouponData})
    
})
}
catch{
      res.redirect('/admin/errorPage')
  }
})
router.post('/editSingleCoupon/:couponId',verifyLoggedIn,async(req,res)=>{
    try{
await adminHelpers.editSingleCoupon(req.params.couponId,req.body)
res.redirect('/admin/couponMangement')
}
catch{
      res.redirect('/admin/errorPage')
  }
})
// st setBannerCative
router.get('/setBannerActive/:bannerId',verifyLoggedIn,async(req,res)=>{
    try{
   await adminHelpers.setBanneractive(req.params.bannerId)
        res.json(response)
    }
    catch{
          res.redirect('/admin/errorPage')
      }
})
router.get('/deleteBanner/:bannerId',verifyLoggedIn,async(req,res)=>{
    try{
   await adminHelpers.deleteBanner(req.params.bannerId)
   res.json(response)
}
catch{
      res.redirect('/admin/errorPage')
  }
})
router.get("/sample",verifyLoggedIn,async (req,res)=>{
    try{
    let reportData= await adminHelpers.getReportData()
}
catch{
      res.redirect('/admin/errorPage')
  }
})

router.get("/deactivateProduct/:prodId",verifyLoggedIn,(req,res)=>{
    try{
productHelpers.deactivateProduct(req.params.prodId).then((response)=>{
    res.json(response)
})
}
catch{
      res.redirect('/admin/errorPage')
  }
})
router.get("/activateProduct/:prodId",(req,res)=>{
    try{
    productHelpers.activateProduct(req.params.prodId).then((response)=>{
        res.json(response)
    })
}
catch{
      res.redirect('/admin/errorPage')
  }
    })


    module.exports = router;