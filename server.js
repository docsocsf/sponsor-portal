const express = require('express');
const session = require('express-session');
const util = require('util')
const krb5 = require('node-krb5')
const rp = require('request-promise');
const mongoose = require('mongoose');
const fs = require('fs');
const fileUpload = require('express-fileupload');

//EXPRESS APP
const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use("/static", express.static(__dirname + '/static'));

app.use(fileUpload());

//PORT
app.set('port', process.env.PORT || 8080);

//JSON PARSER
app.use(express.urlencoded({extended: false})); 
app.use(express.json());   

//SESSION
app.use(session({
  secret: 'shhhhhhhhhhhh',
  resave: false,
  saveUninitialized: true
}))

//EACTIVITIES PORTAL
var options = {
  url: 'https://eactivities.union.ic.ac.uk/API/CSP/605/reports/onlinesales?year=17-18',
  auth: {
    user: 'user',
    password: '03CB83E3-AF2E-4528-98D2-20046AED475A'
  }
}

//MONGOOSE
mongoose.connect('mongodb://localhost/portal');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected to db');
});

//DATABASE SCHEME
var SponsorSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  users: [{
    FirstName: {
      type: String
    },
    LastName: {
      type: String
    },
    Email: {
      type: String
    },
    Username: {
      type: String
    }
  }]
});
var Sponsor = mongoose.model('Sponsor', SponsorSchema);
module.exports = Sponsor;

//PORTAL LOGIN
app.get('/portal-login', (req,res) => {
  res.render("portal-login");
});

//portal auth
app.post('/portal-login', (req,res,next) => {
  if(req.session.docsoc){
    res.redirect('/portal');
  }else{
    next();
  }
}, (req,res) => {
  var user = req.body.user;
  var pass = req.body.pass;
  if(user === "docsoc" && pass === "docsoc"){
    req.session.docsoc = true;
    res.redirect('/portal');
  }else{
    res.redirect('/');
  }
})

//PORTAL
app.get('/portal', (req,res,next) => {
  if(req.session.docsoc){
    next();
  }else{
    res.redirect('/portal-login');
  }
}, (req,res) => {
  Sponsor.find((err, s) => {
    res.render("portal", {sponsors: s});
  })
});

//Add new sponsor
app.post('/new-sponsor', (req,res) => {
  var sponsor = new Sponsor({
    username: req.body.user,
    password: req.body.pass,
    users: []
  });
  
  sponsor.save((err, user) => {
    if (err) {
      return next(err)
    } else {
      console.log(user);
      res.redirect('/portal');
    }
  });
});

//Remove Sponsor
app.post('/remove-sponsor/:user', (req,res) => {
  console.log(req.params.user);
  Sponsor.remove({username: req.params.user} , (err) => {
    if (err) {
      return next(err)
    } else {
      res.redirect('/portal');
    }
  });
});

//LOGIN PAGE
app.get('/',  (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'sponsor'){
      res.redirect('/sponsor');
    }else{
      res.redirect('/member');
    }
  }else{
    next();
  }
},(req,res) => {
  res.render("login");
});


//MEMBER AUTH
app.post('/member-login', (req,res) => {
  var user = req.body.user;
  var pass = req.body.pass;
  console.log('User ' + user + ' trying to login');
  //KERBEROS AUTHENTICATION
  krb5.authenticate(user + "@IC.AC.UK" , pass, (err, stuff) => {
    if(err){
      //WRONG PASSWORD/INVALID USER
      console.log('err ' + err);
      //res.send('wrong username or password');
      res.render('login', {error: "Wrong username or password"});
    }else{
      //REQUEST EACTIVITIES AND CHECK IF DOCSOC MEMBER
      rp(options).then((body) => {
        var data = JSON.parse(body).find(el => el.Customer.Login === user);
        if(data) {
          //VALID USER
          console.log('success');
          req.session.login = true;
          req.session.type = 'member';
          req.session.data = data.Customer;
          res.redirect('/member');
        }else{
          //NON DOCSOC USER
          console.log('not member of DoCSoc');
          res.render('login', {error: "Not a DoCSoc Member!"});
        }
      });
    }
  });
});

app.get('/member-login', (req,res) => {
  res.redirect('/');
})


//member PAGE
app.get('/member', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      next();
    }else if(req.session.type == 'sponsor'){
      res.redirect('/sponsor');
    }
  }else{
    res.redirect('/');
  }
}, (req,res) => {
  var hasCV = fs.existsSync( __dirname + '/cvs/' + req.session.data.Login + '.pdf');
  Sponsor.find((err, s) => {
    res.render('member',{name: req.session.data.FirstName, sponsors: s, CV: hasCV});
  }) 
});

app.post('/upload-cv', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      next();
    }else if(req.session.type == 'sponsor'){
      res.redirect('/sponsor');
    }
  }else{
    res.redirect('/');
  }
},(req,res) => {
  if (!req.files) 
  return res.status(400).send('No files were uploaded.');
  let sampleFile = req.files.file;
  
  sampleFile.mv(__dirname + '/cvs/' + req.session.data.Login + '.pdf', function(err) {
    if (err) 
    return res.status(500).send(err);
    res.redirect('/member');
  });
});

app.post('/show-cv', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      next();
    }else if(req.session.type == 'sponsor'){
      res.redirect('/sponsor');
    }
  }else{
    res.redirect('/');
  }
},(req,res) => {
  var data = fs.readFileSync(__dirname + '/cvs/' + req.session.data.Login + '.pdf');
  res.contentType("application/pdf");
  res.send(data); 
});

app.post('/remove-cv', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      next();
    }else if(req.session.type == 'sponsor'){
      res.redirect('/sponsor');
    }
  }else{
    res.redirect('/');
  }
},(req,res) => {
  fs.unlink(__dirname + '/cvs/' + req.session.data.Login + '.pdf', function(err) {
    if (err) 
    return res.status(500).send(err);
    res.redirect('/member');
  });
});

app.post('/send-cv', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      next();
    }else if(req.session.type == 'sponsor'){
      res.redirect('/sponsor');
    }
  }else{
    res.redirect('/');
  }
},(req,res) => {
  console.log(req.body);
  Sponsor.find((err, sponsors) => {
    sponsors.forEach((sponsor) => {
      var data = {FirstName: req.session.data.FirstName,
        LastName: req.session.data.LastName,
        Email: req.session.data.Email,
        Username: req.session.data.Login}
        if(sponsor.username in req.body){
          sponsor.users.push(data);
        }else{
          sponsor.users = sponsor.users.filter(i => i.Username !== req.session.data.Login)
        }
        sponsor.save((err, user) => {
          if (err) {
            return next(err)
          } else {
            console.log(user);
          }
        }); 
      });
    });
    res.redirect('/');
  });
  
  //SPONSOR AUTH
  app.post('/sponsor-login', (req,res) => {
    var user = req.body.user;
    var pass = req.body.pass;
    Sponsor.find({username: user}, (err,result) => {
      if(err) return console.log(err);
      //console.log(result[0].password);
      if(result[0] && result[0].password === pass){
        //VALID USER
        console.log('success');
        req.session.login = true;
        req.session.type = 'sponsor';
        req.session.data.FirstName = user;
        res.redirect('/sponsor');
      }else{
        res.send("Invalid Username or Password");
      }
    })
  });
  
  //sponsor PAGE
  app.get('/sponsor', (req,res,next) => {
    if(req.session.login){
      if(req.session.type == 'sponsor'){
        next();
      }else if(req.session.type == 'member'){
        res.redirect('/member');
      }
    }else{
      res.redirect('/');
    }
  }, (req,res) => {
    //console.log(req.session);
    Sponsor.find({username: req.session.data.FirstName},(err, s) => {
      res.render('sponsor',{sponsor: s[0]})
    }) 
  });
  
  
  //LOGOUT
  app.post('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('/');
  });
  
  
  //SERVER LISTEN
  app.listen(app.get('port'), function(){
    console.log('Server listening on port ' + app.get('port'));
  });                            
  