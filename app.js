var express = require("express");
var bodyParser = require("body-parser");
var upload = require("./uploads");
var sharp = require("sharp");

var app = express();

var newCardName = "";

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

app.get("/", function (req, res) {
    res.render("home", {
        cardName: newCardName
    });
});

// app.get("/upload",function(req,res){

// });

app.post("/", upload.any(), function (req, res, next) {
    // var tempPath = req.file.path;
    // var targetPath = path.join(__dirname,"./upload/");
    // var cardName = req.body.newCardName;
    // console.log(cardName);
    // console.log("tempPath:"+ tempPath);
    // console.log("target:" + targetPath);
    var query = req.body;
    if(!req.body && !req.files){
        res.json({success:false});
    }else{
        sharp(req.files[0].path).resize(300,270).toFile("public/uploads/"+"300x270-"+req.files[0].filename,function(err){
            if(err){
                console.error("sharp>>>",err);
            }
            console.log("Resizing Success!!");
        });
    }
    
    res.redirect("/");
});

app.listen(3000, function () {
    console.log("Server on port 3000");
});