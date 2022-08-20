var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");

// const { response } = require('../app')
var objectId = require("mongodb").ObjectId;
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
            let data = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()

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
    cancelOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            console.log(orderId, 'reached at helpers ');
            db.get().collection(collection.ORDER_COLLECTION).updateOne({
                _id: objectId(orderId.orderId)
            }, {
                $set: {
                    status: 'cancelled',
                    cancellation: true
                }
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
                                cancellation:false
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
                                        cancellation: false
                                    }
                                ]
                            }
                        }, {
                            $group: {
                                _id: null,
                                totalAmounts: {
                                    $sum: "$totalAmount"
                                }
                            }
                        }
                    ]
            ).toArray().then((data) => {
                resolve(data)
                console.log(data, 'reached  at function .....3.5')
            })}
    )

},
newUsersData:(days) => {
    let day = parseInt(days)
        console.log(day, 'hhlj;l')
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).
            aggregate([
                    {
                        $match: {
                            
                                 timeStamp: {
                                        $gte: new Date(
                                            (new Date().getTime() - (day * 24 * 60 * 60 * 1000))
                                        )
                                    }
                                
                        
                        }
                    }
                     , { $count:"usersCount" }
                ]
        )
        .toArray().then((data) => {
            resolve(data)
            console.log(data, 'reached  at function .....3.5')
        })}
)

},
// fnd cancelled order data 
getCancelledOrderData:(days) => {
    console.log(days,'reached at function..........3 ');
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
                        }
                        , {
                           cancellation:true
                         }
                    ]
                }
            }
             , { $count:"cancelledOrderCount" }
          
        ]).toArray().then((data) => {
            resolve(data)
          
        })
    })
},
orderCount:(days) => {
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
                        }
                        , {
                           cancellation:false
                         }
                    ]
                }
            }
             , { $count:"OrderCountData" }
          
        ]).toArray().then((data) => {
            resolve(data)
          
        })
    })
},

test:async()=>{
let data =await db.get().collection(collection.ORDER_COLLECTION).aggregate( [
    {$match:{cancellation:false}},
    {

        $group: {
           _id: {
              truncatedOrderDate: {
                 $dateTrunc: {
                    date: "$timeStamp", unit: "year", binSize: 1
                 }
              }
           },
           sumQuantity: { $sum: "$totalAmount" },
        }}, {$project:{year:{$year:"$_id.truncatedOrderDate"},sumQuantity:1}},{$sort:{year:1}} 
 ] ).toArray()

 console.log(data,'++++++++++++test data ',data.length,data[0].year)
 let len=data.length
baseyear= data[0].year
let linechartData={}
for(let i=0;i<data.length;i++){
     if(baseyear==data[len-1].year)
     break;
    console.log(i)
    if(baseyear==data[i].year){
       baseyear++
       

    }else{
        
        let a={sumQuantity:0,year:baseyear}
data.push(a)
   baseyear++
   i--
   if(i==len-1)
   break
  
console.log(i)
       


    }
    
}
data.sort(function (a, b) {
    return a.year - b.year;
  });
console.log(data,'after forloop ')
let linechartYear=[]
let linechartSum=[]
data.forEach(element => {
    let a=element.year
    linechartYear.push(a)
})
data.forEach(element => {
    let a=element.sumQuantity
    linechartSum.push(a)
})

linechartData.year=linechartYear
linechartData.sum=linechartSum
console.log(linechartData,'after forloop......... ')
return(linechartData)
},


// donut chart 
dotNutChartData:async()=>{
    let dotNut=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {$group : {_id:"$paymnetMethod", count:{$sum:1}}}
    ]).toArray()
let data=[['Payment Method','Numbers']]

    dotNut.forEach(element => {
    let a=[element]
    data.push(a)
});



return(dotNut)
    
    
},

// single order data 
getOneCatagory:(cataId)=>{
    return new Promise(async(resolve,reject)=>{
        db.get().collection(collection.CATAGORY_COLLECTION).find({_id:objectId(cataId)}).toArray().then((response)=>{
            resolve(response)
        })
    })
},

// add coupons into collection 
addCouponCode: async(couponData)=>{

       let response= await db.get().collection(collection.COUPON_COLLECTION).insertOne(couponData)
       console.log(response)
             db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:objectId(response.insertedId)},{$set:{startDate:new Date(couponData.startDate),endDate:new Date(couponData.endDate),status:true}})
},

getCouponCodes:()=>{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.COUPON_COLLECTION).find().toArray().then((couponData)=>{
            resolve(couponData)
        })
    })
}
}
             