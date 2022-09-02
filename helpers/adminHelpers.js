var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const moment = require("moment");
var objectId = require("mongodb").ObjectId;
var ObjectId = require("mongodb").ObjectId;
const { order } = require("paypal-rest-sdk");

// const { response } = require('../app')
var objectId = require("mongodb").ObjectId;
let reportData = []

async function debitAmountwallet(userId,amount,description){
    userId=userId.toString()
   
  let user= await db.get().collection(collection.WALLET_COLLECTION).find({userId:userId}).toArray()
  console.log(user)
 
  if(user.length>0){
     historyData={description:description,
         amount:-(parseInt(amount)),
         timeStamp:new Date(),
         date:new Date().toISOString().replace(/T.*/,'').split('-').reverse().join('-'),
        debit:true,
        credit:false}
 
 await db.get().collection(collection.WALLET_COLLECTION).updateOne({userId:userId},{$push:{history:historyData}})
  }
  else{
 
  let historyData={
     userId:userId,
   
   history:[ {description:description,
     amount:-amount,
     timeStamp:new Date(),
     date:new Date().toISOString().replace(/T.*/,'').split('-').reverse().join('-'),
    debit:true,
    credit:false}]
  }
     await db.get().collection(collection.WALLET_COLLECTION).insertOne(historyData).then((response)=>{
     })
  }
  }
 
  async function creditAmountwallet(userId,amount,description){
    userId=userId.toString()
     let user= await db.get().collection(collection.WALLET_COLLECTION).find({userId:userId}).toArray()
   
    
     if(user.length>0){
        historyData={
         description:description,
            amount:amount,
            timeStamp:new Date(),
            date:new Date().toISOString().replace(/T.*/,'').split('-').reverse().join('-'),
           debit:false,
           credit:true
         }
    
    await db.get().collection(collection.WALLET_COLLECTION).updateOne({userId:userId},{$push:{history:historyData}})
  }
  else{
 
     let historyData={
        usesrId:userId,
      
      history:[ {description:description,
        amount:amount,
        timeStamp:new Date(),
        date:new Date().toISOString().replace(/T.*/,'').split('-').reverse().join('-'),
       debit:false,
       credit:true}]
     }
        await db.get().collection(collection.WALLET_COLLECTION).insertOne(historyData)
     }
 
  }
 
 
 
 






module.exports = {
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let userDetails = await db.get().collection(collection.USER_COLLECTION).find().toArray();

            resolve(userDetails);
        });
    },
    updateUser: (userId, userData) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: objectId(userId)
            }, {
                $set: {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    address: userData.address,
                    city: userData.city,
                    country: userData.country,
                    mobileNumber: userData.mobileNumber,
                    pinCode: userData.pinCode,
                    email: userData.email

                }
            })
            resolve();
        });
    },
    addUser: (userData) => {
        return new Promise(async (resolve, reject) => {
            console.log(userData);
            userData.password = await bcrypt.hash(userData.password, 10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.insertedId);
                
            });
        });
    },
    getUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).findOne({_id: objectId(userId)}).then((userDetails) => {
                resolve(userDetails);
            })


        });

    },
    // add banner
    addBanner: (bannerDetails) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.BANNER_COLLECTION).insertOne(bannerDetails).then((data) => {
                db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:data.insertedId},{$set:{active:false}})
                resolve(data);
            });
        });
    },
    // get banner
    getBanner: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()

            resolve(data);

        })

    },
    getBannerOne: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.BANNER_COLLECTION).find({active:true}).toArray()

            resolve(data)

        })

    },
    getOrderDetails: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).find().toArray().then((response) => {
                resolve(response)
            })
        })
    },
    getAllOrderDetails: (orderId, userId) => {
        let response = {}

        return new Promise(async (resolve, reject) => {

            response.userData = await db.get().collection(collection.USER_COLLECTION).findOne({_id: objectId(userId)})

            response.productData = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(orderId)
                    }
                }, {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'


                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },


            ]).toArray()

            response.orderData = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(orderId)
                    }
                }, {
                    $project: {
                        deliveryDetails: 1,
                        paymnetMethod: 1,
                        totalAmount: 1,
                        status: 1,
                        date: 1
                    }
                }
            ]).toArray()


            resolve(response)
        })
    },
    cancelOrder: async(orderId) => {
        return new Promise(async (resolve, reject) => {

          await  db.get().collection(collection.ORDER_COLLECTION).updateOne({
                _id: objectId(orderId.orderId)
            }, {
                $set: {
                    status: 'Cancelled',
                    cancellation: true
                }
            }).then(async(response)=>{
                let orderData=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId.orderId)})
                console.log('paymentmethodjhvsdb',orderData);
                if(orderData.paymnetMethod!='COD'){
                    console.log('jkhghfdkjhsac resched inside out ');
                    await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(orderData.userId)},{$inc:{wallet:orderData.finalAmount}})
                    let description=orderId.orderId+" order cancelled"
                    creditAmountwallet(orderData.userId,orderData.finalAmount,description)
                    orderData= await  db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId.orderId)})
                    console.log(orderData); 

                }
                resolve(response)
            })


        })

    },
    orderStatusUpdate: (orderId, status) => {
        console.log(orderId, status)
        return new Promise(async (resolve, reject) => {
            if (status == 'Cancelled') 
                await db.get().collection(collection.ORDER_COLLECTION).updateOne({
                    _id: objectId(orderId)
                }, {
                    $set: {
                        status: status,
                        cancellation: true
                    }
                })
             else 
                await db.get().collection(collection.ORDER_COLLECTION).updateOne({
                    _id: objectId(orderId)
                }, {
                    $set: {
                        status: status
                    }
                })


            


        })

    },
    getLineChartData: (days) => {
        console.log('reached at function..........3 ');
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [
                            {
                                timeStamp: {
                                    $gte: new Date(
                                        (new Date().getTime() - (7 * 24 * 60 * 60 * 1000))
                                    )
                                }
                            }, {
                                cancellation: false,
                                refund:false
                            }
                        ]
                    }
                }, {
                    $project: {
                        timeStamp: 1,
                        status: 1
                    }
                }, {
                    $project: {
                        totalAmounts: 1
                    }
                }
            ]).toArray().then((data) => {
                resolve(data)
                console.log(data, 'reached  at function .....3.5')
            })
        })
    },

    getRevenueData: (days) => {
        let day = parseInt(days)
        console.log(day, 'hhlj;l')
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [
                            {
                                timeStamp: {
                                    $gte: new Date(
                                        (new Date().getTime() - (day * 24 * 60 * 60 * 1000))
                                    )
                                }
                            }, {
                                cancellation: false,
                                refund:false
                            }
                        ]
                    }
                }, {
                    $group: {
                        _id: null,
                        totalAmounts: {
                            $sum: "$finalAmount"
                        }
                    }
                }
            ]).toArray().then((data) => {
                resolve(data)
                console.log(data, 'reached  at function .....3.5')
            })
        })

    },
    newUsersData: (days) => {
        let day = parseInt(days)
        console.log(day, 'hhlj;l')
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: {

                        timeStamp: {
                            $gte: new Date(
                                (new Date().getTime() - (day * 24 * 60 * 60 * 1000))
                            )
                        }


                    }
                }, {
                    $count: "usersCount"
                }
            ]).toArray().then((data) => {
                resolve(data)
                console.log(data, 'reached  at function .....3.5')
            })
        })

    },
    // fnd cancelled order data
    getCancelledOrderData: (days) => {
        console.log(days, 'reached at function..........3 ');
        let day = parseInt(days)
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [
                            {
                                timeStamp: {
                                    $gte: new Date(
                                        (new Date().getTime() - (day * 24 * 60 * 60 * 1000))
                                    )
                                }
                            }, {
                                cancellation: true
                            }
                        ]
                    }
                }, {
                    $count: "cancelledOrderCount"
                }

            ]).toArray().then((data) => {
                resolve(data)

            })
        })
    },
    orderCount: (days) => {
        let day = parseInt(days)
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [
                            {
                                timeStamp: {
                                    $gte: new Date(
                                        (new Date().getTime() - (day * 24 * 60 * 60 * 1000))
                                    )
                                }
                            }, {
                                cancellation: false
                            }
                        ]
                    }
                }, {
                    $count: "OrderCountData"
                }

            ]).toArray().then((data) => {
                resolve(data)

            })
        })
    },

    test: async () => {
        let data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match: {
                    cancellation: false,
                    refund:false
                }
            }, {

                $group: {
                    _id: {
                        truncatedOrderDate: {
                            $dateTrunc: {
                                date: "$timeStamp",
                                unit: "year",
                                binSize: 1
                            }
                        }
                    },
                    sumQuantity: {
                        $sum: "$finalAmount"
                    }
                }
            }, {
                $project: {
                    year: {
                        $year: "$_id.truncatedOrderDate"
                    },
                    sumQuantity: 1
                }
            }, {
                $sort: {
                    year: 1
                }
            }
        ]).toArray()

       
        let len = data.length
        baseyear = data[0].year
        let linechartData = {}
        for (let i = 0; i < data.length; i++) {
            if (baseyear == data[len - 1].year) 
                break;
            


            console.log(i)
            if (baseyear == data[i].year) {
                baseyear ++


            } else {

                let a = {
                    sumQuantity: 0,
                    year: baseyear
                }
                data.push(a)
                baseyear ++
                i--
                if (i == len - 1) 
                    break


                


                console.log(i)


            }

        }
        data.sort(function (a, b) {
            return a.year - b.year;
        });
     
        let linechartYear = []
        let linechartSum = []
        data.forEach(element => {
            let a = element.year
            linechartYear.push(a)
        })
        data.forEach(element => {
            let a = element.sumQuantity
            linechartSum.push(a)
        })

        linechartData.year = linechartYear
        linechartData.sum = linechartSum
        console.log(linechartData, 'after forloop......... ')
        return(linechartData)
    },


    // donut chart
    dotNutChartData: async () => {
        let dotNut = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                $group: {
                    _id: "$paymnetMethod",
                    count: {
                        $sum: 1
                             }
                }
            },
            {
                $sort:{_id:1}
            }
        ]).toArray()
        let data = [['Payment Method', 'Numbers']]

        dotNut.forEach(element => {
            let a = [element]
            data.push(a)
        });


        return(dotNut)


    },

    // single order data
    getOneCatagory: (cataId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.CATAGORY_COLLECTION).find({_id: objectId(cataId)}).toArray().then((response) => {
                resolve(response)
            })
        })
    },

    // add coupons into collection
    addCouponCode: async (couponData) => {

        let response = await db.get().collection(collection.COUPON_COLLECTION).insertOne(couponData)
       
        db.get().collection(collection.COUPON_COLLECTION).updateOne({
            _id: objectId(response.insertedId)
        }, {
            $set: {
                startDate: new Date(couponData.startDate),
                endDate: new Date(couponData.endDate),
                status: true
            }
        })
    },

    getCouponCodes: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.COUPON_COLLECTION).find().toArray().then((couponData) => {
                resolve(couponData)
            })
        })
    },


    fetchMonthlyData: async () => {
      reportData=[];
     
return new Promise(async(resolve,reject)=>{
    await db.get().collection(collection.CATAGORY_COLLECTION).aggregate([{
        $project: {
            catagory: 1,
            _id: 0
        }
    }]).toArray().then((catagory)=>{
        resolve(catagory)
    })

})   
    },
   
 fetchData:async(catagory,selectedYear)=>{
    selectedYear= parseInt(selectedYear)
    console.log(selectedYear)

   return new Promise(async(resolve,reject)=>{


     await catagory.map(async(element) => {
      
        return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.ORDER_COLLECTION).aggregate([

            {
                $project: {
                    refund:1,
                    cancellation: 1,
                    finalAmount: 1,
                    products: 1,
                    year: {
                        $year: "$timeStamp"
                    },
                    timeStamp: 1


                }
            },
            {
                $match: {
                    refund:false,
                    cancellation: false,
                    year: selectedYear
                }
            },
            {
                $unwind: "$products"
            },
            {
                $project: {
                    productId: "$products.item",
                    productQuantity: "$products.quantity",
                    finalAmount: 1,
                    timeStamp: 1,
                    year: 1,
                    _id: 1

                }
            }, {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            }, {
                $project: {
                    catagory: "$product.catagory",
                    subCatagory: "$product.subCatagory",
                    month: {
                        $month: "$timeStamp"
                    },
                    productQuantity: 1,
                    finalAmount: 1,
                    timeStamp: 1,
                    year: 1
                }
            }, {
                $match: {
                    catagory: element.catagory
                }
            }, {
                $group: {
                    _id: {
                        month: {
                            $month: "$timeStamp"
                        }
                    },
                    finalAmount: {
                        $sum: "$finalAmount"
                    },
                    productQuantity: {
                        $sum: "$productQuantity"
                    }
                }

            }, {
                $sort: {
                    _id: 1
                }
            }, {
                $project: {
                    month: "$_id.month",
                    finalAmount: 1,
                    productQuantity: 1,
                    _id: 0
                }
            }
        ]).toArray()
        
       

    .then((data)=>{

        if (data.length < 12) {

            for (let i = 1; i <= 12; i++) {
                let datain = true;
                for (let j = 0; j < data.length; j++) {
                    if (data[j].month === i) {
                        datain = null;
                    }

                }

                if (datain) {
                    data.push({finalAmount: 0, productQuantity: 0, month: i})
                }

            }
        }
       return data
    }).then(async(data)=>{
   
        await data.sort(function (a, b) {
            return a.month - b.month
         });
         return data
    }).then(async(data)=>{

             reportData.push({catagory: element.catagory, data: data})
             
         return(reportData)

    })

})

})
 setTimeout(() =>{resolve(reportData)
 console.log(reportData,".........tes")
}, 500); //
//  await resolve(reportData)
// console.log(reportData,".........tes")
// resolve(reportData)
})
    

},
fetchYears:async()=>{
  let year= await db.get().collection(collection.ORDER_COLLECTION).aggregate([{$group:{_id:{year:{$year:"$timeStamp"}}}},{$project:{year:"$_id.year",_id:0}},{$sort:{year:-1}}]).toArray()
 return year

},

// to apply catagory offer 
applyCatagoryOffer:async(cataData)=>{ 
    cataData.offerPercentageEntered=parseInt(cataData.offerPercentageEntered)
let productData=  await db.get().collection(collection.PRODUCT_COLLECTION).find({catagory:cataData.cataName}).toArray() 
   productData.map(async(data)=>{
    data.catagoryOfferApplied=true
    data.offerPercentage=cataData.offerPercentageEntered
    data.offerPrice=Math.round((1-cataData.offerPercentageEntered/100)*data.regularPrice)
    data.discountedPrice=cataData.offerPercentageEntered/100*data.regularPrice
    await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(data._id)},  
            {$set:
                {
                    catagoryOfferApplied: data.catagoryOfferApplied,
                    offerPercentage:data.offerPercentage,
                    offerPrice:data.offerPrice,
                    discountedPrice:data.discountedPrice
                
                }},{upsert:true})
})
   let response=      await db.get().collection(collection.CATAGORY_COLLECTION).updateOne({catagory:cataData.cataName},{$set:{catagoryOfferApplied:true,offerPercentage:cataData.offerPercentageEntered}},{upsert:true})
return(response)

},
removeCatagoryOffer:async(cataData)=>{
    let productData=  await db.get().collection(collection.PRODUCT_COLLECTION).find({catagory:cataData.cataName}).toArray()
    productData.map(async(data)=>{

        data.offerPercentage=data.productOfferPercentage
        data.offerPrice=(1-data.offerPercentage/100)*data.regularPrice
        data.discountedPrice=(data.offerPercentage/100)*data.regularPrice
        console.log(data)
        await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(data._id)},  
        {$set:
            {
                catagoryOfferApplied: false,
                offerPercentage:data.offerPercentage,
                offerPrice:data.offerPrice,
                discountedPrice:data.discountedPrice
            
            }},{upsert:true})

    })
    let response=await db.get().collection(collection.CATAGORY_COLLECTION).updateOne({catagory:cataData.cataName},{$set:{catagoryOfferApplied:false,offerPercentage:null}},{upsert:true})
return(response)

},
approveRefund:(orderId)=>{         
    return new Promise(async(resolve,reject)=>{
     let orderData= await  db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})
        console.log(orderData);
        await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(orderData.userId)},{$inc:{wallet:orderData.finalAmount}})
    let description=orderId+"product returned and refunded"
        creditAmountwallet(orderData.userId,orderData.finalAmount,description)
        await  db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{$unset:{refundWait:true},$set:{status:"Refunded",refund:true}},{upsert:true}) 
     orderData= await  db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})
     console.log(orderData);            
    })                            
     
    },
    singleCouponHistory:(couponId)=>{
        return new Promise(async(resolve,reject)=>{
          await  db.get().collection(collection.ORDER_COLLECTION).aggregate([{$match:{couponId:objectId(couponId)}},{$project:{userId:1,paymnetMethod:1,totalAmount:1,finalAmount:1,timeStamp:1,couponId:1,status:1}}]).toArray().then((response)=>{
resolve(response)
            })
        
        })
        
    },
    getCouponData:(couponId)=>{
        console.log('reached at admin helpersd singleCouponHistory',couponId);
        return new Promise((resolve,reject)=>{
         db.get().collection(collection.COUPON_COLLECTION).findOne({_id:ObjectId(couponId)}).then((singleCouponData)=>{
            console.log(singleCouponData);
            resolve(singleCouponData)
        })
        })
    },
    editSingleCoupon:async(couponId,couponData)=>{
        await db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:ObjectId(couponId)},{$set:{
           
            couponCode:couponData.couponCode,
            offerPercentage:couponData.offerPercentage,
            offerCap:couponData.offerCap,

            startDate: new Date(couponData.startDate),
                endDate: new Date(couponData.endDate),
                status: true
        }})
        return
    },
    getProductDataHome:async()=>{
       
        let getProductDataHome={}

        var latest = new Promise(async(resolve,reject)=>{
            var latests=  await db.get().collection(collection.PRODUCT_COLLECTION).find({readyForSale:true}).limit(30).toArray()
                resolve(latests)
            })
            var menData = new Promise(async(resolve,reject)=>{
                var menDatas = await db.get().collection(collection.PRODUCT_COLLECTION).find({$and:[{catagory:"Men"},{readyForSale:true}]}).limit(9).toArray()
         resolve(menDatas)
        })
            var womenData = new Promise(async(resolve,reject)=>{
                var womenDatas =    await db.get().collection(collection.PRODUCT_COLLECTION).find({$and:[{catagory:"Women"},{readyForSale:true}]}).limit(9).toArray()
                    resolve(womenDatas)
                 })
             
                var kidsData = new Promise(async(resolve,reject)=>{
                    var kidsDatas =  await  db.get().collection(collection.PRODUCT_COLLECTION).find({$and:[{catagory:"Kids"},{readyForSale:true}]}).limit(9).toArray()
                        resolve(kidsDatas)
                     })
                 [menData,womenData,kidsData,latest]= await Promise.allSettled([menData,womenData,kidsData,latest]).then((data)=>{
                    getProductDataHome.men=data[0].value
                    getProductDataHome.women=data[1].value
                    getProductDataHome.kids=data[2].value
                    getProductDataHome.new=data[3].value

                    
                 })
             
                 return getProductDataHome
    },
    setBanneractive:async(bannerId)=>{
        console.log('reache at active ')
       await db.get().collection(collection.BANNER_COLLECTION).updateMany({},{$set:{active:false}},{multi:true})
     let response =  await db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:objectId(bannerId)},{$set:{active:true}})
       return response
    },
    deleteBanner:async(bannerId)=>{
        await db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectId(bannerId)}).then((response)=>{
            return response
        })
    },
    getReportData:async()=>{
     let reportData=[]
        let year= await db.get().collection(collection.ORDER_COLLECTION).aggregate([{$group:{_id:{year:{$year:"$timeStamp"}}}},{$project:{year:"$_id.year",_id:0}},{$sort:{year:-1}}]).toArray()
  async function getData (){
        for(i=0;i<year.length;i++) {
    let  data=   await db.get().collection(collection.ORDER_COLLECTION).aggregate([

            {
                $project: {
                    refund:1,
                    cancellation: 1,
                    finalAmount: 1,
                    products: 1,
                    year: {
                        $year: "$timeStamp"
                    },
                    timeStamp: 1


                }
            },
            {
                $match: {
                    refund:false,
                    cancellation: false,
                    year:year[i].year
                }
            },
            {
                $unwind: "$products"
            },
            {
                $project: {
                    productId: "$products.item",
                    productQuantity: "$products.quantity",
                    finalAmount: 1,
                    timeStamp: 1,
                    year: 1,
                    _id: 1

                }
            }, {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            }, {
                $project: {
                    catagory: "$product.catagory",
                    subCatagory: "$product.subCatagory",
                    month: {
                        $month: "$timeStamp"
                    },
                    productQuantity: 1,
                    finalAmount: 1,
                    timeStamp: 1,
                    year: 1
                }
            }, {
                $group: {
                    _id: {
                        month: {
                            $month: "$timeStamp"
                        }
                    },
                    finalAmount: {
                        $sum: "$finalAmount"
                    },
                    productQuantity: {
                        $sum: "$productQuantity"
                    }
                }

            }, {
                $sort: {
                    _id: 1
                }
            }, {
                $project: {
                    month: "$_id.month",
                    finalAmount: 1,
                    productQuantity: 1,
                    _id: 0
                }
            }
        ]).toArray()
       


if (data.length < 12) {

    for (let i = 1; i <= 12; i++) {
        let datain = true;
        for (let j = 0; j < data.length; j++) {
            if (data[j].month === i) {
                datain = null;
            }

        }

        if (datain) {
            data.push({finalAmount: 0, productQuantity: 0, month: i})
        }

    }
}
await data.sort(function (a, b) {
    return a.month - b.month
 });
 reportData.push({year: year[i].year, data: data})
}}
await getData();
console.log(reportData[0],"reportDatareportData");
return reportData




}

}
