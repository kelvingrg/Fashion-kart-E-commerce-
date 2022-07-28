var db = require("../config/connection");
var collection = require("../config/collections");
var objectId = require("mongodb").ObjectId;
module.exports={
    addProduct:(prodDetails)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(prodDetails).then((data)=>{
                resolve();
        })
    })
    },
    getProducts:()=>{
        return new Promise(async(resolve,reject)=>{
         let productsData= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(productsData)
    })
    },
    getProduct:(prodId)=>{
        return new Promise(async(resolve,reject)=>{
         let productData= await db.get().collection(collection.PRODUCT_COLLECTION).find({_id:objectId(prodId)}).toArray() 
            resolve(productData)
    })
    }, 
    updateProduct: (prodId,productData) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(prodId)},{$set:{
          
    
productTitle:productData.productTitle,
regularPrice:productData.regularPrice,
offerPrice:productData.offerPrice,
catagory:productData.catagory,
subCatagory:productData.subCatagory,
images:productData.images
}})
            resolve();
        });
      }

}