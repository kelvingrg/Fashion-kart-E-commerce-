var db = require("../config/connection");
var collection = require("../config/collections");
const { ObjectID } = require("bson");
var objectId = require("mongodb").ObjectId;
module.exports = {
  addProduct: (prodDetails) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .insertOne(prodDetails)
        .then((data) => {
          resolve();
        });
    });
  },

  // get all products 
    getProductss: () => {
    return new Promise(async (resolve, reject) => {
      let productsData = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(productsData);
    });
  },
  // get all products which is listed under particular subcatagory 
  getProducts: (subcata) => {
    return new Promise(async (resolve, reject) => {
      let productsData = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({subCatagory:subcata})
        .toArray();
      resolve(productsData);
    });
  },

  //productsVeiwMainCata
  productsVeiwMainCata: (maincata) => {
    return new Promise(async (resolve, reject) => {
      let productsData = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({catagory:maincata})
        .toArray();
      resolve(productsData);
    });
  },

  getProduct: (prodId) => {
    return new Promise(async (resolve, reject) => {
      let productData = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ _id: objectId(prodId) })
        .toArray();
      resolve(productData);
    });
  },
  updateProduct: (prodId, productData) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectId(prodId) },
          {
            $set: {
              productTitle: productData.productTitle,
              regularPrice: productData.regularPrice,
              offerPrice: productData.offerPrice,
              catagory: productData.catagory,
              subCatagory: productData.subCatagory,
              images: productData.images,
            },
          }
        );
      resolve();
    });
  },
  deleteProduct: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: objectId(prodId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  //add catagory
  addCatagory: (catDta) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATAGORY_COLLECTION)
        .insertOne(catDta)
        .then((data) => {
          resolve();
        });
    });
  },


  //get catagory
  getCatagory: () => {
    return new Promise(async (resolve, reject) => {
      let catData = await db
        .get()
        .collection(collection.CATAGORY_COLLECTION)
        .find()
        .toArray()
        .then((data) => {
          resolve(data);
        });
    });
  },

  // delete category
  deleteCatagory:(cataData)=>{
    console.log(cataData)
    return new Promise(async(resolve,reject)=>{
      db.get().collection(collection.PRODUCT_COLLECTION).find({catagory:cataData.cataName}).toArray().then((data)=>{
        resolve(data.length)
      })
    })


  },
  // delete catagory with products 
  deleteCatagoryWithProd:(data)=>{
    return new Promise(async(resolve,reject)=>{
     await db.get().collection(collection.PRODUCT_COLLECTION).find({catagory:data.cataName}).toArray().then((response)=>{
      console.log(data,".............45")
        if(data.length==0){
          db.get().collection(collection.CATAGORY_COLLECTION).remove({catagory:data.cataName})
        }else{
           db.get().collection(collection.PRODUCT_COLLECTION).remove({catagory:data.cataName})
           db.get().collection(collection.CATAGORY_COLLECTION).remove({catagory:data.cataName})
        }
        resolve(response)
        console.log(response);
      }) 
    })

  },

  getSubCatagory: (subCata) => {
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.CATAGORY_COLLECTION)
        .aggregate([
          { $match: { catagory: subCata.subCatagory } },
          { $unwind: "$subCatagory" },
          { $project: { subCatagory: 1, _id: 0 } },
        ])
        .toArray();

      resolve(data);
    });
  },
  //get catagory based on input 
  getNavCatagory: (cata) => {
    console.log(cata)
    return new Promise(async (resolve, reject) => {
      let catData = await db
        .get()
        .collection(collection.CATAGORY_COLLECTION)
        .find()
        .toArray()
        .then((data) => {
          resolve(data);
        });
    });
  },


//add or update banners 
// updateProduct: (bannerId, bannerData) => {
//   return new Promise(async (resolve, reject) => {
//     await db
//       .get()
//       .collection(collection.PRODUCT_COLLECTION)
//       .updateOne(
//         { _id: objectId(bannerId) },
//         {
//           $set: {
//             bannerTitle1: bannerData.bannerTitle1,
//             bannerTitle2: bannerData.bannerTitle2,
//             bannerTitle3: bannerData.bannerTitle3,
//             images: bannerData.images,
//           },
//         }
//       );
//     resolve();
//   });
//}
updateSubCata:async(cataData)=>{
  db.get().collection(collection.CATAGORY_COLLECTION).updateOne({_id:objectId(cataData.cataId)},{$pull:{subCatagory:cataData.cataName}})
  db.get().collection(collection.CATAGORY_COLLECTION).updateOne({_id:objectId(cataData.cataId)},{$push:{subCatagory:cataData.newCataName}})
await db.get().collection(collection.PRODUCT_COLLECTION).updateMany({subCatagory:cataData.cataName},{$set:{subCatagory:cataData.newCataName}}).then((response)=>{
  return(response)
})
 

  
  
},
updateMainCata:async(cataData)=>{
  console.log("reached at main cata function")
  db.get().collection(collection.CATAGORY_COLLECTION).updateOne({_id:objectId(cataData.cataId)},{$set:{catagory:cataData.newCataName}})
await db.get().collection(collection.PRODUCT_COLLECTION).updateMany({catagory:cataData.cataName},{$set:{catagory:cataData.newCataName}}).then((response)=>{
  return(response)
})
 

  
  
},

// add catagory offer 
addCatagoryOffer:(catagory)=>{
  return new Promise(async(resolve,response)=>{
    db.get().collection(collection.PRODUCT_COLLECTION).updateMany({catagory:catagory},{$set:{offerPrice:{}}})
  })
  

},
updateNewSubCatagory:(cataData,cataId)=>{
  console.log(cataData);
  return new Promise(async(resolve,reject)=>{
   await db.get().collection(collection.CATAGORY_COLLECTION).updateOne({_id:ObjectID(cataId)},{$set:{subCatagory:cataData.subCatagory}})
    resolve()
  })

}
}

