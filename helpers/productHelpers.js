var db = require("../config/connection");
var collection = require("../config/collections");
const { ObjectID } = require("bson");
var objectId = require("mongodb").ObjectId;
var Handlebars=require('handlebars')
Handlebars.registerHelper('inc', function (value, options) {
  return parseInt(value) + 1;
});
module.exports = {
  addProduct:async (prodDetails) => {
   
    console.log('prodDetails',prodDetails);
    if(prodDetails.readyForSale=="readyForSale"){
      prodDetails.readyForSale=true
    }else{
      prodDetails.readyForSale=false
    }
    prodDetails.offerPercentage=parseInt(prodDetails.productOfferPercentage)
    prodDetails.productOfferPercentage=parseInt(prodDetails.productOfferPercentage)
    prodDetails.regularPrice=parseInt(prodDetails.regularPrice)
    prodDetails.quantity=parseInt(prodDetails.quantity)
    prodDetails.offerPrice=(1-prodDetails.offerPercentage/100)*(prodDetails.regularPrice)
    prodDetails.timeStamp=new Date();
    prodDetails.catagoryOfferApplied=false
    console.log('prodDetails',prodDetails);
  
    
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
  getProducts: (subcata,pageno=1,limit=2) => {
    
    pageno=parseInt(pageno)
    limit=parseInt(limit)

    let skip=limit*(pageno-1)
    if(skip<=0) skip=0;
    
    
    return new Promise(async (resolve, reject) => {
      let productsData = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({$and:[{subCatagory:subcata},{readyForSale:true}]})
       .skip(skip).limit(limit).toArray()
     
    
       productsData.pageno=pageno
       productsData.subCata=subcata
       productsData.subcata=true
       productsData.maincata=false
       productsData.all=false

     
        
        productsData.count= await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({$and:[{subCatagory:subcata},{readyForSale:true}]}).count()
        
        productsData.count=Math.floor(productsData.count/limit)
        productsData.pageNos=[]
       if ( productsData.count<1){
        productsData.pageNos=[{ pageno: 1, currentPage: true}]
       }else{

      
        for(i=1;i<= productsData.count;i++){
          if(pageno==i){
            productsData.pageNos.push({
              pageno:i,
              currentPage:true
            })
          }else{
            productsData.pageNos.push({
              pageno:i,
              currentPage:false
            })
          }
         
        } }
        resolve(productsData);
        
    });
  },

  //productsVeiwMainCata
  productsVeiwMainCata: (maincata,pageno=1,limit=2) => {
    pageno=parseInt(pageno)
    limit=parseInt(limit)
    let skip=limit*(pageno-1)
    if(skip<=0) skip=0;
    console.log(skip,limit)

    return new Promise(async (resolve, reject) => {
      let productsData = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({$and:[{catagory:maincata},{readyForSale:true}]})
        .skip(skip).limit(limit).toArray()
        productsData.pageno=pageno
        productsData.mainCata=maincata
        productsData.subcata=false
        productsData.maincata=true
        productsData.all=false
 
         productsData.count= await db
         .get()
         .collection(collection.PRODUCT_COLLECTION)
         .find({$and:[{catagory:maincata},{readyForSale:true}]}).count()
         
         productsData.count=Math.floor(productsData.count/limit)
         productsData.pageNos=[]
        if ( productsData.count<1){
         productsData.pageNos=[{ pageno: 1, currentPage: true}]
        }else{
 
       
         for(i=1;i<= productsData.count;i++){
           if(pageno==i){
             productsData.pageNos.push({
               pageno:i,
               currentPage:true
             })
           }else{
             productsData.pageNos.push({
               pageno:i,
               currentPage:false
             })
           }
          
         } }




      resolve(productsData);
    });
  },
  
  //  ALL PRODUCTS 
  allProducts:(pageno=1,limit=2)=>{

    pageno=parseInt(pageno)
    limit=parseInt(limit)
    let skip=limit*(pageno-1)
    if(skip<=0) skip=0;
    console.log(skip,limit)

    return new Promise(async (resolve,reject)=>{
      await  db.get().collection(collection.PRODUCT_COLLECTION).find({readyForSale:true}).skip(skip).limit(limit).toArray().then(async(productsData)=>{
         productsData.pageno=pageno
        productsData.subcata=false
        productsData.maincata=false
        productsData.all=true
 
         productsData.count= await db
         .get()
         .collection(collection.PRODUCT_COLLECTION)
         .find({readyForSale:true}).count()
         
         productsData.count=Math.floor(productsData.count/limit)
         productsData.pageNos=[]
        if ( productsData.count<1){
         productsData.pageNos=[{ pageno: 1, currentPage: true}]
        }else{
 
       
         for(i=1;i<= productsData.count;i++){
           if(pageno==i){
             productsData.pageNos.push({
               pageno:i,
               currentPage:true
             })
           }else{
             productsData.pageNos.push({
               pageno:i,
               currentPage:false
             })
           }
          
         } }




      resolve(productsData);
        
        })
    })
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
        if(data.length==0){
          db.get().collection(collection.CATAGORY_COLLECTION).remove({catagory:data.cataName})
        }else{
           db.get().collection(collection.PRODUCT_COLLECTION).updateMany({catagory:data.cataName},{$set:{readyForSale:false}},{multi:true})
          
        }
        resolve(response)
        
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

},
deactivateProduct:(prodId)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(prodId)},{$set:{readyForSale:false}}).then((response)=>{
resolve(response)         
    })
  })
},
activateProduct:(prodId)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(prodId)},{$set:{readyForSale:true}}).then((response)=>{
resolve(response)         
    })
  })
}
}

