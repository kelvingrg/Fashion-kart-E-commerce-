const multer=require('multer')
const fileStorageEngine=multer.diskStorage
let storage=fileStorageEngine({
    destination:(req,file,cb)=>{
        cb(null,'./images')

    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+"--"+file.Orginalnmae);
    }
})
