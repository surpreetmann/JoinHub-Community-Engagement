var path = require("path");
var express = require("express");
var app = express();
var fs = require("fs");
var session = require("express-session");
var nodemailer = require('nodemailer');
var ejs = require("ejs");
var multer = require("multer");
//const mongoOp = require("./mongo");
const router = express.Router();
var passport=require("passport");
var GutHubStrategy=("passport-github").Strategy;


app.set("views", path.join(__dirname, "Views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({secret: "surpreetChitkara"}));

var mongoose = require("mongoose");
var mongoDB = "mongodb://localhost/admin";

mongoose.connect(mongoDB);

mongoose.connection.on("error", err => {
  console.log("DB connection Error");
});

mongoose.connection.on("connected", err => {
  console.log("DB connected");
});

var loginSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  email: String,
  phoneNo: String,
  dob: String,
  city: String,
  gender: String,
  userType: String,
  status: Number,
  photoname: String,
  githubid: String
});

var comSchema = new mongoose.Schema({
	cName: String,
	cRule : String,
	cLoc : String,
	cOwner : String,
	cDate : String,
	cStatus : String,
	cDesc : String,
	photoname: String
})

var com_instance = mongoose.model('communities', comSchema);

var login = mongoose.model("users", loginSchema);

var tagSchema = new mongoose.Schema({
  tname: String,
  createdby: String,
  createddate: String
});

var tag = mongoose.model("tagpannel", tagSchema);

app.post("/addtag", function(req, res) {
  //console.log(req.body);
  let newtag = new tag({
    tname: req.body.tname,
    createdby: req.session.username,
    createddate: req.body.createddate
  });
  newtag
    .save()
    .then(data => {
      //   console.log(data)
       mailto(data.email,data.password);
      //   res.redirect("/menutags");
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.send(error);
    });
});

app.get("/gettaglist", function(req, res) {
  tag
    .find({
      // search query
      // username : req.body.username,
    })
    .then(data => {
      //  console.log(data)
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.send(error);
    });
});

app.post("/log", function(req, res) {
  login
    .find({
      username: req.body.username,
      password: req.body.password
    })
    .then(data => {
      if (data.length > 0) {
        if(req.session.isLogin){
          console.log("Thankyou");
        }
        else {


        console.log(data);
        req.session.isLogin=1;
        req.session.username = data[0].username;
        req.session.password = data[0].password;
        req.session.dob = data[0].dob;
        req.session.city = data[0].city;
        req.session.gender = data[0].gender;
        req.session.phoneNo = data[0].phoneNo;
        req.session.email = data[0].email;
        req.session.photoname = data[0].photoname;
        console.log(req.session.username);

      }




        res.redirect("/templating");
      } else {
        // res.redirect("/")
        console.log("some problem");
        res.redirect("/");
      }
    })
    .catch(err => {
      console.error(err);
      res.send(error);
    })
})

var middleFunc = function(req, res, next) {
  if (req.session.isLogin) {
    next();
  } else {
    //Ask for id password
    res.redirect("/");
    //   next();
  }
};

app.post("/checkun", function(req, res) {
  console.log(req.body);
  login
    .find({
      // search query
      username: req.body.username
    })
    .then(data => {
      //  console.log(data)
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.send(error);
    });
});

app.get("/changepassword", middleFunc, function(req, res) {
  res.render("menuchangepass",{data: [
    {
      email: req.session.email,
      gender: req.session.gender,
      username: req.session.username,
      city: req.session.city,
      dob: req.session.dob,
      phoneNo: req.session.phoneNo,
      photoname:req.session.photoname
    }
  ]});
});

app.get("/getadduser", middleFunc, function(req, res) {
  res.render("menuadduser",{data: [
    {
      email: req.session.email,
      gender: req.session.gender,
      username: req.session.username,
      city: req.session.city,
      dob: req.session.dob,
      phoneNo: req.session.phoneNo,
      photoname:req.session.photoname
    }
  ]});
});

app.post("/adduserdata", function(req, res) {

  let newlogin = new login({
    name: req.body.fullname,
    username: req.body.username,
    email: req.body.username,
    password: req.body.password,
    phoneNo: req.body.phone,
    city: req.body.city,
    userType: req.body.roleoptions,
    status: 1,
    gender: req.body.gender,
    dob: req.body.dob
  });

  newlogin
    .save()
    .then(data => {
      //   console.log(data)
        mailto(data.email,data.password);
      res.redirect("/getadduser");
      //res.send(data)
    })
    .catch(err => {
      console.error(err);
      res.send(error);
    });
});

var GitHubStrategy = require('passport-github').Strategy;

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user,done){
        done(null,user);
    });

    passport.deserializeUser(function(user,done){
        done(null,user);
    });

    passport.use(
          new GitHubStrategy({
          clientID: '350e494f3766f253be7f',
          clientSecret: '85955f7c6e05e144e676810ea4e3ebaca0bc5ca4',
          callbackURL: "/auth/github/callback",
          session:true
          },function(accessToken, refreshToken, profile, cb) {
              console.log('###############################');
              console.log('passport callback function fired');
              console.log(profile);
              console.log("-----------profile ka khtm---------------");
              return cb(null,profile);

          })
      );

    app.get('/auth/github',passport.authenticate('github'));

    app.get('/auth/github/callback',passport.authenticate('github', { failureRedirect: 'index.html' }), function (req, res)
      {

          console.log("githubsignin succesful");

          login.find({
            githubid : req.session.passport.user._json.id

          })
          .then(data =>
          {

          if(data.length>0)
            {
              console.log("-----------MIL GEYA---------");
              console.log(data);
              req.session.islogin = 1;

              console.log(data);

              req.session.isLogin = 1;
              //req.session.username = data[0].username ;
              req.session.username = data[0].username;
              //obj.city=data[0].city;
              req.session.city=data[0].city;
              req.session.role=data[0].role;
              req.session.name=data[0].name;
              req.session.status=data[0].status;
              //obj.state=data[0].state;
              req.session.githubid = data[0].githubid;
              req.session.photoname= data[0].photoname;
              req.session.email=data[0].email;
              if(data[0].gender)
              {
                req.session.gender = data[0].gender;
                req.session.phoneNo = data[0].phone;
                req.session.dob = data[0].dob;
              }
              req.session._id=data[0]._id;

              console.log('github login successful')

              console.log("------------added--------------");
              res.redirect('/templating');
            }
            else
            {
              console.log("nahi MILA==-===-0=-0-=0786789809");
              var obj = {
              username : req.session.passport.user._json.login,
              email : req.session.passport.user._json.email,
             city : req.session.passport.user._json.location,
              status : 0,
              role : "admin",
              githubid : req.session.passport.user._json.id,
              photoname : "git.png"

              }
              login.create(obj,function(error,result)
              {
                if(error)
                throw error;
                else {

                  req.session.username = obj.username;
                  req.session.email=obj.email;
                  req.session.city=obj.city;
                  req.session.role=obj.role;
                  req.session.photoname=obj.photoname;

                  login.find({
                      githubid : req.session.passport.user._json.id
                  })
                  .then(data =>
                  {
                    req.session.data._id = data[0]._id;
                    console.log("89456123168645312658645312\n"+req.session.data);
                  })
                  .catch(err =>
                  {
                    throw err;
                  })
                  res.redirect('/templating');
                }
              })
            }
            console.log("welkjlwejljfwelkjclkwejlkcjlkwejc");
            res.end();
          })
          .catch(err =>
          {
            res.send(err)
          })
      })

app.get("/sendmail",function(req,res){
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '123@gmail.com',
      pass: '123'
    }
  });
  var user_name=req.body.username;
  var mailOptions = {
    from: '123@gmail.com',
    to: req.body.username,
    subject: 'An alert regarding CQ',
    html :  "Hello <strong>user</strong> ,<br>You are already using <i>CQ</i>, <br> Grab the most out of it by asking our CQ mentors who are readily available to help you anytime :)<br>Kindly note:<br><br><h5>Regards<br>(Surpreet Kaur)<br>Admin CQ</h5><br> <br> <strong> Note:</strong><u> This a computer generated message. Please don't reply to it.</u>"



  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
    console.log('Email sent: ' + info.response);
    }
  });

})

app.get("/getdata", function(req, res) {
  //console.log(req.session.username);
  res.send(req.session);
});

app.get("/gettable", function(req, res) {
  login
    .find({
      // search query
      // username : req.body.username,
    })
    .then(data => {
      //  console.log(data)
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.send(error);
    });
});

app.get("/templating", middleFunc, (req, res) => {
  //  console.log(req.session.username);
  //var data=JSON.parse(req.session);
  res.render("menu", {
    data: [
      {
        email: req.session.email,
        gender: req.session.gender,
        username: req.session.username,
        city: req.session.city,
        dob: req.session.dob,
        phoneNo: req.session.phoneNo,
        photoname:req.session.photoname
      }
    ]
  });
});

app.get("/logout", middleFunc, (req, res) => {
  //  console.log(req.session.isLogin);
  //var data=JSON.parse(req.session);
  res.render("logout",{data: [
    {
      email: req.session.email,
      gender: req.session.gender,
      username: req.session.username,
      city: req.session.city,
      dob: req.session.dob,
      phoneNo: req.session.phoneNo,
      photoname:req.session.photoname
    }
  ]});
});

app.get("/yeslogout", function(req, res) {
  req.session.destroy(err => {
    if (err) {
      return console.log(err);
    }
    res.send();
  });
});

app.get("/showuser", middleFunc, (req, res) => {
  //  console.log(req.session.username);
  //var data=JSON.parse(req.session);
  res.render("menushowuser",{data: [
    {
      email: req.session.email,
      gender: req.session.gender,
      username: req.session.username,
      city: req.session.city,
      dob: req.session.dob,
      phoneNo: req.session.phoneNo,
      photoname:req.session.photoname
    }
  ]});
});

app.get("/menutags", middleFunc, (req, res) => {
  //  console.log(req.session.username);
  //var data=JSON.parse(req.session);
  res.render("menutags",{data: [
    {
      email: req.session.email,
      gender: req.session.gender,
      username: req.session.username,
      city: req.session.city,
      dob: req.session.dob,
      phoneNo: req.session.phoneNo,
      photoname:req.session.photoname
    }
  ]});
});

app.get("/menucommunitylist", middleFunc, (req, res) => {

  res.render("menucommunitylist",{data: [
    {
      email: req.session.email,
      gender: req.session.gender,
      username: req.session.username,
      city: req.session.city,
      dob: req.session.dob,
      phoneNo: req.session.phoneNo,
      photoname:req.session.photoname
    }
  ]});
});

app.post("/doupdate", function(req, res) {
  console.log(req.body);
  login
    .findOneAndUpdate(
      {
        _id: req.body.id

      },
      {
        username: req.body.username,
        phoneNo: req.body.phone,
        city: req.body.city,
        status: req.body.status,
        userType: req.body.role


      },
      {
        new: true, // return updated doc
        runValidators: true // validate before update
      }
    )
    .then(data => {
      console.log(data);
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.send(error);
    });
});

app.post("/changePass", function(req, res) {
  //console.log(req.body);
  //    res.redirect("/changepassword");
  login
    .findOneAndUpdate(
      {
        username: req.session.username,
        password: req.body.oldPassword
        // search query
      },
      {
        password: req.body.newPassword


      },
      {
        new: true,
        runValidators: true
      }
    )
    .then(data => {
      console.log(data);
      if (data) res.redirect("/changepassword");
      else console.log("wrongpass");
    })
    .catch(err => {
      console.error(err);
      res.send(error);
    });
});

app.get("/showtaglist", middleFunc, (req, res) => {
  //  console.log(req.session.username);
  //var data=JSON.parse(req.session);
  res.render("menushowtaglist",{data: [
    {
      email: req.session.email,
      gender: req.session.gender,
      username: req.session.username,
      city: req.session.city,
      dob: req.session.dob,
      phoneNo: req.session.phoneNo,
      photoname:req.session.photoname
    }
  ]});
});

app.post("/deleteaction", function(req, res) {
  // console.log(req.body);
  tag
    .find({
      _id: req.body.id
      // search query
      // username : req.body.username,
    })
    .then(data => {
      //  console.log(data)
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.send(err);
    });
});

app.post("/updatepopup", function(req, res) {
  console.log(req.body);
  login
    .find({
      _id: req.body.id
      // search query
      // username : req.body.username,
    })
    .then(data => {
      //  console.log(data)
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.send(error);
    });
});

app.post("/deletetag", function(req, res) {
  tag
    .findOneAndDelete({
      _id: req.body.id
      // search query
    })
    .then(data => {
      //  console.log(data)
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.send(err);
    });
});

app.post("/gettablewithuser", function(req, res) {
  console.log(req.body);
  login
    .find({
      userType: req.body.userType
      // search query
      // username : req.body.username,
    })
    .then(data => {
      //  console.log(data)
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.send(err);
    });
});

app.post("/gettablewithstatus", function(req, res) {
  console.log(req.body);
  login
    .find({
      status: req.body.status
    })
    .then(data => {
      //  console.log(data)
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.send(err);
    });
});

app.get('/edit',middleFunc, function(req, res) {
  res.render("edituserHome", {
    data: [
      {
        email: req.session.email,
        gender: req.session.gender,
        username: req.session.username,
        city: req.session.city,
        dob: req.session.dob,
        phoneNo: req.session.phoneNo,
        photoname:req.session.photoname
      }
    ]
  });

});

app.get('/editprofile', middleFunc, function(req,res)  {
  res.render('profileedit',{data: [
    {
      email: req.session.email,
      gender: req.session.gender,
      username: req.session.username,
      city: req.session.city,
      dob: req.session.dob,
      phoneNo: req.session.phoneNo,
      photoname:req.session.photoname
    }
  ]});
});



router.get('/users',(req,res) => {
  var pageNo =parseInt(req.query.pageNo)
  var size =parseInt(req.query.size)
  var query = {}
  if(pageNo < 0 || pageNo === 0) {
        response = {"error" :true,"message" : "invalid page number, should start with 1"};
        return res.json(response);
  }
  query.skip = size * (pageNo - 1);
  query.limit = size;
  // Find some documents
       mongoose.count({},function(err,totalCount) {
             if(err) {
               response = {"error": true,"message" : "Error fetching data"}
             }
         mongoose.find({},{},query,function(err,data) {
              // Mongo command to fetch all data from collection.
            if(err) {
                response ={"error" : true,"message" : "Error fetching data"};
            } else {
                var totalPages =Math.ceil(totalCount / size);
                response ={"error" : false,"message" :data,"pages": totalPages};
            }
            res.json(response);
         });
       })
})

app.get('/cl',function(request,response)
    {
      var data = com_instance.find({}).exec(function(error,result)
      {
        if(error)
        throw error;
        else
        response.send(JSON.stringify(result))
      })
    })



function mailto(mail_person,pass)
{

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '123@gmail.com',
      pass: '1234'
    }
  });



  var mailOptions = {
    from: '123@gmail.com',
    to: mail_person,
    subject: 'Registration successful',
    html :  "Hello <strong>user</strong> ,<br>You have been successfully registered on <i>CQ</i>, a platform, where you can ask any doubts regarding your projects.<br> Grab the most out of it by asking our CQ mentors who are readily available to help you anytime :)<br>Kindly note:<br><i>Your username: </i>" +mail_person+ "<br><i>Your password:</i> " +pass+ " .<br><h5>Regards<br>(Surpreet Kaur)<br>Admin CQ</h5><br> <br> <strong> Note:</strong><u> This a computer generated message. Please don't reply to it.</u>"



  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
    console.log('Email sent: ' + info.response);
    }
  });

}

var photoName ;

var storage = multer.diskStorage({
  destination : './public',
  filename : function(req, file, callback)
  {
    photoName=file.fieldname + '-' + Date.now() + '@' +path.extname(file.originalname)
    callback(null,photoName);
  }
})

var upload = multer({
  storage : storage
}).single('myImage');

app.post('/upload',(req,res) => {
  upload(req,res,(err)=>{
    if(err)
    {
      throw error;
    }
    else{
      console.log(req.file);
      console.log(photoName);
    // console.log(req.session.data.id);

      login.updateOne({ "_id" : req.session._id } , { $set : { "photoname" : photoName } }  ,function(error,result)
      {
        console.log(result);
        if(error)
          {
            console.log("error vale mai");
            throw error;
          }
        else
        {
          console.log("update vale mai");
         req.session.photoname = photoName;
        //req.session.photoname=photoName;
          console.log(req.session.data);
        //  console.log(req.session.data.photoname);
          res.render('menu', {
            data: [
              {
                email: req.session.email,
                gender: req.session.gender,
                username: req.session.username,
                city: req.session.city,
                dob: req.session.dob,
                phoneNo: req.session.phoneNo,
                photoname: req.session.photoname
              }
            ]
          });
        }
      })
  }
})
});

app.put('/adminEdit',function(req,res){
    console.log(req.body);
    login.findOneAndUpdate(
    {
       email : req.session.email,
    },
    {
      name : req.body.name,
	  dob : req.body.dob,
	  phoneNo : req.body.phoneNo,
	  city : req.body.city,
	  gender: req.body.gender,
    username : req.body.username
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
        res.send(data)
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})

app.use('/api',router);



app.listen(3000);
