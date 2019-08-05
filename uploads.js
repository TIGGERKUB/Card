var multer = require("multer");
var path = require("path");

var upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, 'public/uploads');
        },
        filename: function (req, file, callback) {

            callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));


        }
    }),
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname)
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback( /*res.end('Only images are allowed')*/ null, false)
        }

        callback(null, true)
    }
});

module.exports = upload;