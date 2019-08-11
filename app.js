var express = require("express");
var bodyParser = require("body-parser");
var upload = require("./public/js/uploadImg");

var cards = [];

var app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

app.get("/", function (req, res) {
    res.render("home", {
        card: cards
    });
});

app.post("/upload", function (req, res) {

    upload(req, res, function (err) {
        if (err) {
            res.render("home", {
                msg: err,
                card: cards
            });
        } else {
            cards.push({
                name: req.body.title,
                content: req.body.content
            });
            res.render("home", {
                msg: "File Uploaded!",
                file: `uploads/${req.file.filename}`,
                card: cards
            });
        }
    });
});

app.listen(3000, function () {
    console.log("Server on port 3000");
});