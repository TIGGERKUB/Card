var express = require("express");
var bodyParser = require("body-parser");
var upload = require("./public/js/uploadImg");

var cardNames = [];

var app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

app.get("/", function (req, res) {
    res.render("home", {
        cardName: cardNames
    });
});

app.post("/upload", function (req, res) {

    upload(req, res, function (err) {
        if (err) {
            res.render("home", {
                msg: err,
                cardName: cardNames
            });
        } else {
            var card = {
                name: req.body.title
            };
            cardNames.push(card.name);
            res.render("home", {
                msg: "File Uploaded!",
                file: `uploads/${req.file.filename}`,
                cardName: cardNames
            });
        }
    });
});

app.listen(3000, function () {
    console.log("Server on port 3000");
});