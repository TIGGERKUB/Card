require('dotenv').config();
var express = require("express");
var bodyParser = require("body-parser");
var upload = require("./public/js/uploadImg");
var mongoose = require("mongoose");
var fs = require("fs");
var _ = require("lodash");
var encrypt = require("mongoose-encryption");

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
var userSchema = new mongoose.Schema({
    username: String,
    password: String
});
console.log(process.env.SECRET);

userSchema.plugin(encrypt, {
    secret: process.env.SECRET,
    encryptedFields: ["password"]
});

var User = mongoose.model("users", userSchema);
var Item = mongoose.model("cards", itemSchema);
var errorMessage = "";

app.get("/", function (req, res) {
    res.render("index");
});

app.get("/gallery", function (req, res) {
    Item.find({}, function (err, cards) {
        res.render("gallery", {
            card: cards,
            error: errorMessage
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

app.post("/post", function (req, res) {
    var requestId = req.body.id;
    Item.findById(requestId, function (err, cards) {
        if (err) {
            res.send(err);
        } else {
            res.render("post", {
                card: cards
            });
        }
    });
});

app.post("/login", function (req, res) {
    var username = req.body.loginUsername;
    var password = req.body.loginPassword;
    User.findOne({
        username: username
    }, function (err, foundUser) {
        if (err)
            res.redirect("/gallery");
            
        else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.redirect("/gallery");
                } else {
                    res.send("Invalid username or password ");
                }
            } else {
                res.send("Register first");
            }
        }
    });
});

app.post("/register", function (req, res) {
    var newUser = new User({
        username: req.body.registUsername,
        password: req.body.registPassword
    });
    newUser.save(function (err) {
        if (err)
            console.log(err);
        else {
            console.log("Registration Success");
            res.redirect("/");
        }
    });
});

app.post("/gallery", function (req, res) {

    upload(req, res, function (err) {
        errorMessage = "";
        if (err) {
            console.log(err);
            errorMessage = err;
            res.redirect("/gallery");
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
            res.redirect("/gallery");
        }
    });

});

app.post("/delete", function (req, res) {
    var itemId = req.body.remove;
    Item.findByIdAndRemove(itemId, function (err) {
        if (!err) {
            console.log("remove " + itemId + " complete!");
            res.redirect("/gallery");
        }
    });
});

app.listen(3000, function () {
    console.log("Server on port 3000");
});