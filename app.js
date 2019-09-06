require("dotenv").config();
var express = require("express");
var bodyParser = require("body-parser");
var upload = require("./public/js/uploadImg");
var mongoose = require("mongoose");
var fs = require("fs");
var _ = require("lodash");
var encrypt = require("mongoose-encryption");
var session = require("express-session");
var passport = require("passport");
var passportLocalMongoose = require("passport-local-mongoose");
var LocalStrategy = require("passport-local").Strategy;
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var findOrCreate = require("mongoose-findorcreate");

var app = express();

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(express.static("public"));

app.use(
  session({
    secret: "Confidential",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

//connect mongoDB
mongoose.connect("mongodb://localhost:27017/galleryDB", {
  useNewUrlParser: true
});
mongoose.set("useCreateIndex", true);

var cardSchema = new mongoose.Schema({
  name: String,
  content: String,
  img: {
    data: Buffer,
    contentType: String
  }
});
var userSchema = new mongoose.Schema({
  username: String,
  password: String,
  cards: [cardSchema]
});

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("users", userSchema);
var Card = mongoose.model("cards", cardSchema);

var errorMessage = "";
var dummyID;

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/gallery", function (req, res) {
  if (req.isAuthenticated()) {
    User.findById(req.user._id, function (err, foundUser) {
      if (err) console.log(err);
      else {
        res.render("gallery", {
          card: foundUser.cards,
          error: errorMessage
        });
      }
    });
  } else {
    res.redirect("/");
  }
});

app.get("/img", function (req, res, next) {
  Card.findOne({}, function (err, cards) {
    if (err) res.send(err);
    if (cards) {
      res.contentType(cards.img.contentType);
      res.send(cards.img.data);
    }
  });
});

app.get("/img/:id", function (req, res) {
  Card.findOne({
      _id: req.params.id
    },
    function (err, cards) {
      if (err) res.send(err);
      res.setHeader("content-type", cards.img.contentType);
      res.send(cards.img.data);
    }
  );
});

app.get("/post", function (req, res) {
  if (req.isAuthenticated()) {
    Card.findById(dummyID, function (err, cards) {
      res.render("post", {
        card: cards
      });
    });
  } else {
    res.redirect("/");
  }
});

app.post("/login", function (req, res) {
  var user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/gallery");
      });
    }
  });
});

app.post("/register", function (req, res) {
  User.register({
      username: req.body.username
    },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/gallery");
        });
      }
    }
  );
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
      var newCard = new Card({
        name: cardName,
        content: cardContent,
        img: {
          data: fs.readFileSync(req.file.path),
          contentType: req.file.mimetype
        }
      });
      User.findOne({
          username: req.user.username
        },
        function (err, foundUser) {
          if (err) {
            console.log(err);
          } else {
            foundUser.cards.push(newCard);
            foundUser.save();
            newCard.save();
            res.redirect("/gallery");
          }
        }
      );
    }
  });
});

app.post("/delete", function (req, res) {
  var itemId = req.body.remove;
  User.findOneAndUpdate({
      username: req.user.username
    }, {
      $pull: {
        cards: {
          _id: itemId
        }
      }
    },
    function (err, foundUser) {
      if (!err) {
        Card.findByIdAndRemove(itemId, function (err) {
          if (!err) {
            console.log("Remove item complete!");
            res.redirect("/gallery");
          }
        });
      }
    }
  );
});

app.post("/post",function(req,res){
  var request = req.body.cardId;
  dummyID = request;
  res.redirect("/post");
});

app.listen(3000, function () {
  console.log("Server on port 3000");
});