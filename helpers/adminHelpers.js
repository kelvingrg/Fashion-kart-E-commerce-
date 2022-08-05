var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");

// const { response } = require('../app')
var objectId = require("mongodb").ObjectId;
module.exports = {
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let userDetails = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();

      resolve(userDetails);
    });
  },
  updateUser: (userId,userData) => {
    return new Promise(async (resolve, reject) => {
        await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{
        firstName:userData.firstName,
        lastName:userData.lastName,
        address:userData.address,
        city:userData.city,
        country:userData.country,
        mobileNumber:userData.mobileNumber,
        pinCode:userData.pinCode ,
        email:userData.email

        }})
        resolve();
    });
  },
  addUser: (userData) => {
    return new Promise(async (resolve, reject) => {
      console.log(userData);
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve(data.insertedId);
        });
    });
  },
  getUser:(userId)=>{
     return new Promise(async (resolve, reject) => {
     await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ _id: objectId(userId) }).then((userDetails)=>{
        resolve(userDetails);
      })
     

 
  });

  },
  // add banner 
addBanner: (bannerDetails) => {
  return new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.BANNER_COLLECTION)
      .insertOne(bannerDetails)
      .then((data) => {
        resolve(data);
      });
  });
},
//get banner 
getBanner: () => {
  return new Promise(async (resolve, reject) => {
   let data= await db
      .get()
      .collection(collection.BANNER_COLLECTION)
      .find().toArray()
      
        resolve(data);
     
    })

},
getBannerOne: () => {
  return new Promise(async (resolve, reject) => {
    let data= await db
      .get()
      .collection(collection.BANNER_COLLECTION)
      .find().toArray()
       
      resolve(data)

      })
        
}
}
