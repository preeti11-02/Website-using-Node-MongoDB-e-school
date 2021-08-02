const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

var bodyParser = require("body-parser") // new added

const User = require("./models/User");

const authenticateUser = require("./middlewares/authenticateUser");

const app = express();

// new line

// app.use( express.static( "public" ) );
app.use( express.static( "views" ) );     // for image      
// const AdminUser = require("./models/AdminUser");    // for acessign the AdminUser
// till here


// mongdb cloud connection is here
mongoose
  .connect("mongodb://localhost/e-School", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connected to mongodb cloud! :)");
  })
  .catch((err) => {
    console.log(err);
  });

// middlewares
app.use(express.urlencoded({ extened: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// cookie session
app.use(
  cookieSession({
    keys: ["randomStringASyoulikehjudfsajk"],
  })
);

// ===================================================================================================================================
// route for serving frontend files
// ===================================================================================================================================

app
  .get("/", (req, res) => {
    res.render("mainpage");
  })
  .get("/login", (req, res) => {
    res.render("login");
  })
  .get("/register", (req, res) => {
    res.render("register");
  })
  .get("/adminlogin", (req, res) => {
    res.render("adminlogin");
  })
  .get("/genreport", (req, res) => {
    res.render("genreport");
  })
  .get("/resrecorded", (req, res) => {
    res.render("responsesucessful");
  })
  .get("/AfterStuLogin", authenticateUser, (req, res) => {
    res.render("AfterStuLogin", { user: req.session.user });
  })
  .get("/back",(req, res) => {
    res.render("genreport", { user: req.session.user });
  });

// ===================================================================================================================================
// route for handling post requirests
// ===================================================================================================================================

app
  .post("/login", async (req, res) => {
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) {
      res.send("Please enter all the fields");
      return;
    }

    const doesUserExits = await User.findOne({ email });

    if (!doesUserExits) {
      res.send("invalid username or password");
      return;
    }

    const doesPasswordMatch = await bcrypt.compare(
      password,
      doesUserExits.password
    );

    if (!doesPasswordMatch) {
      res.send("invalid useranme or password");
      return;
    }

    // else he\s logged in
    req.session.user = {
      email,
    };

    res.redirect("/AfterStuLogin");
  })
  .post("/register", async (req, res) => {
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) {
      res.send("Please enter all the fields");
      return;
    }

    const doesUserExitsAlreay = await User.findOne({ email });

    if (doesUserExitsAlreay) {
      res.send("A user with that email already exits please try another one!");
      return;
    }

    // lets hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const latestUser = new User({ email, password: hashedPassword });

    latestUser
      .save()
      .then(() => {
        // res.send("account registered!");
        res.redirect("/resrecorded");
        return;
      })
      .catch((err) => console.log(err));
  });

//logout
app.get("/logout", authenticateUser, (req, res) => {
  req.session.user = null;
  res.redirect("/login");
});

// ====================================================================================================================================
// Feedback configuration
// ====================================================================================================================================

var db = mongoose.connection;

app.post("/feedback",(req,res)=>{
  var name = req.body.name;
  var email = req.body.email;
  var Website = req.body.Website;
  var comment = req.body.comment;

  var data = {
      "name": name,
      "email" : email,
      "website": Website,
      "comment" : comment
  }

  db.collection('students').insertOne(data,(err,collection)=>{
      if(err){
          throw err;
      }
      console.log("Record Inserted Successfully");
  });

  return res.redirect('/resrecorded')

})

// ====================================================================================================================================
// Content suggestion
// ====================================================================================================================================
var db = mongoose.connection;

app.post("/suggestions",(req,res)=>{
  var name = req.body.nameT;
  var email = req.body.emailT;
  var choice = req.body.choice;
  var part = req.body.part;
  var suggestion = req.body.commentT;

  var data = {
      "name": name,
      "email" : email,
      "was": choice,
      "om" : part,
      "your" : suggestion
  }

  db.collection('suggestions').insertOne(data,(err,collection)=>{
      if(err){
          throw err;
      }
      console.log("Record Inserted Successfully");
  });

  return res.redirect('/resrecorded')

})

// ====================================================================================================================================
// Suggestion Result from database
// ====================================================================================================================================
const UsersuggestionSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  was: {
    type: String,
    required: true,
  },
  om: {
    type: String,
    required: true,
  },
  your: {
    type: String,
    required: true,
  },
});

const suggestions =mongoose.model("suggestions", UsersuggestionSchema);

app.get('/sugesreport', (req, res) => {
  suggestions.find({}, function(err, suggestions1) {
        res.render('sugesreport', {
          suggestions1List: suggestions1
        })
        console.log(suggestions1);
    })
})
// ====================================================================================================================================
// User  Result from database
// ====================================================================================================================================

const UserrecordSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// const User2 =mongoose.model("User", UserrecordSchema);

app.get('/userreport', (req, res) => {
  User.find({}, function(err, Users) {
      res.render('userreport', {
          UsersList: Users
      })
      console.log(Users);
  })
})

// ====================================================================================================================================
// Feedback  Result from database
// ====================================================================================================================================
const User123Schema =mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
});

const feedbacks =mongoose.model("students", User123Schema);

app.get('/feedbackreport', (req, res) => {
    feedbacks.find({}, function(err, feedbacks1) {
        res.render('feedbackreport', {
            feedbacks1List: feedbacks1
        })        
        console.log(feedbacks1);

    })
})

// const feed159 =mongoose.model("feedback", User123Schema);
// const feedbacks =mongoose.model("feedback", User123Schema);
// console.log(feed159);
// app.get('/feedbackreport', (req, res) => {
//     feed159.find({}, function(err, feed456) {
//         res.render('feedbackreport', {
//           feed456List: feed456
//         })        
//         console.log(feed456);

//     })
// })

// app.get('/feedbackreport', (req, res) => {
//   feedbacks.find({}, function(err, feedbacks1) {
//         res.render('feedbackreport', {
//           feedbacks1List: feedbacks1
//         })
//         console.log(feedbacks1);
//     })
// })

// ===================================================================================================================================
// server config
// ===================================================================================================================================
const PORT = 3300;
app.listen(PORT, () => {
  console.log(`Server started listening on port: ${PORT}`);
});
