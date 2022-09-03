const mongoClient=require('mongodb').MongoClient
// require('dotenv').config()

const state ={
    db:null
}
module.exports.connect=function(done){
    const url="mongodb+srv://kelvingeorge:ayN92tQs5GHTicpa@cluster0.heyq6sz.mongodb.net/?retryWrites=true&w=majority"
    // const url="mongodb://localhost:27017/"
    const dbname='fashionKart'
    mongoClient.connect(url,(err,data)=>{
        if(err) 
        return done(err)
        state.db=data.db(dbname) //if there is no erroe then it will connect with data base and send 
        done()
    })

}
module.exports.get=function(){
    return state.db
}
