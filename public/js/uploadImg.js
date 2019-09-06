var multer = require("multer");
var path = require("path");
//set storage engine
var Storage = multer.diskStorage({
    // destination: function (req, file, callback) {
    //     callback(null, 'public/uploads');
    // },
    filename: function (req, file, callback) {

        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));

    }
});

//init upload
// cb=callback
var upload = multer({
    storage: Storage,
    limits: {
        fileSize: 5000000
    },
    fileFilter: function(req,file,cb){
        checkFileType(file,cb);
    }
}).single("img");

//check file type function
function checkFileType(file,cb){
    //Allowed ext(extension)
    var filetypes = /jpeg|jpg|png|gif/;
    //Check ext
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    var mimetype = filetypes.test(file.mimetype);
    if(mimetype && extname){
        return cb(null,true);
    }else{
        cb("Error: Image Only!");
    }
}

module.exports = upload;