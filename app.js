var express = require("express");
var bodyParser = require("body-parser");
var upload = require("./public/js/uploadImg");
var mongoose = require("mongoose");
var fs = require("fs");
var _ = require("lodash");

var app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

//connect mongoDB
mongoose.connect('mongodb://localhost:27017/cardDB', {
    useNewUrlParser: true
});

var itemSchema = {
    name: String,
    content: String,
    img: {
        data: Buffer,
        contentType: String
    }
};

var Item = mongoose.model("cards", itemSchema);

app.get("/", function (req, res) {
    Item.find({}, function (err, cards) {
        res.render("home", {
            card: cards
        });
    });
});

app.get('/img', function (req, res, next) {
    try {
        Item.findOne({}, function (err, cards) {
            if (err)
                res.send(err);
            if (cards) {
                res.contentType(cards.img.contentType);
                res.send(cards.img.data);
            }
        });
    } catch (e) {
        res.send(e);
    }
});

app.get('/img/:id', function (req, res) {
    try {
        Item.findOne({
            _id: req.params.id
        }, function (err, cards) {
            if (err)
                res.send(err);
             res.setHeader('content-type', cards.img.contentType);
            res.send(cards.img.data);
        });
    } catch (e) {
        res.send(e);
    }
});

app.post("/", function (req, res) {

    upload(req, res, function (err) {
        if (err) {
            console.log(err);
        } else {
            //save to mongodb
            var cardName = req.body.title;
            var cardContent = req.body.content;
            var newCard = new Item({
                name: cardName,
                content: cardContent,
                img: {
                    data: fs.readFileSync(req.file.path),
                    contentType: req.file.mimetype
                }
            });
            newCard.save();
            res.redirect("/");
        }
    });

});

app.listen(4000, function () {
    console.log("Server on port 4000");
});