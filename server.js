const express = require('express') 
const session = require('express-session') 
const util = require('util')
const krb5 = require('node-krb5')
const rp = require('request-promise') 
const mongoose = require('mongoose') 
const fs = require('fs') 
const fileUpload = require('express-fileupload') 

//EXPRESS APP
const app = express() 

app.set('view engine', 'pug') 
app.set('views', __dirname + '/views') 

app.use('/static', express.static(__dirname + '/static')) 

app.use(fileUpload()) 

//PORT
app.set('port', process.env.PORT || 8080) 

//JSON PARSER
app.use(express.urlencoded({extended: false}))  
app.use(express.json())    

//SESSION
app.use(session({
  secret: 'shhhhhhhhhhhh',
  resave: false,
  saveUninitialized: true
}))

//EACTIVITIES PORTAL
var options = {
  //Change this to get correct auth
  url: 'https://eactivities.union.ic.ac.uk/API/CSP/605/reports/onlinesales?year=17-18',
  auth: {
    user: 'user',
    password: '03CB83E3-AF2E-4528-98D2-20046AED475A'
  }
}
const authpath = __dirname + '/auth/auth.json' 

//MONGOOSE
mongoose.connect('mongodb://localhost/portal') 
var db = mongoose.connection 
db.on('error', console.error.bind(console, 'connection error:')) 
db.once('open', function() {
  console.log('connected to db') 
}) 

//DATABASE SCHEME
var SponsorSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  name: {
    type: String
  },
  password: {
    type: String,
    required: true,
  },
  rank: {
    type: String
  },
  posts: [{
    date: {
      type: String
    },
    title: {
      type: String
    },
    text: {
      type: String
    }
  }],
  positions: [{
    name: {
      type: String
    },
    info: {
      type: String
    },
    users: [{
      FirstName: {
        type: String
      },
      Surname: {
        type: String
      },
      email: {
        type: String
      },
      username: {
        type: String
      },
      cv: {
        type: String
      }
    }]
  }]
}) 
var Sponsor = mongoose.model('Sponsor', SponsorSchema) 
module.exports = Sponsor 

//===============LOGIN=================

//LOGIN PAGE
app.get('/',  (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'sponsor'){
      res.redirect('/sponsor') 
    }else{
      res.redirect('/member') 
    }
  }else{
    next() 
  }
},(req,res) => {
  res.render('login' , {member: true}) 
}) 

//MEMBER AUTH
app.post('/member-login', (req,res) => {
  var user = req.body.user 
  var pass = req.body.pass 
  console.log('User ' + user + ' trying to login...') 
  //KERBEROS AUTHENTICATION
  console.log('starting Kerberos Authentication...') 
  krb5.authenticate(user + '@IC.AC.UK' , pass, (err, stuff) => {
    if(err){
      //WRONG PASSWORD/INVALID USER
      console.log('err ' + err) 
      //res.send('wrong username or password') 
      res.render('login', {member: true, error: 'Wrong username or password'}) 
    }else{
      console.log('Kerberos Authentication success.') 
      console.log('Starting DoCSoc Member Check...') 
      //REQUEST EACTIVITIES if auth file older than 24 hours
      if(!fs.existsSync(__dirname + '/auth/')){
        fs.mkdirSync(__dirname + '/auth/') 
      }
      if (fs.existsSync(authpath)) {
        var stat = fs.statSync(authpath) 
        if (err) {
          return console.error(err) 
        }
        var now = new Date().getTime() 
        //86400000 ms is 24 hours
        endTime = new Date(stat.ctime).getTime() + 86400000 
        if (now > endTime) {
          //download new file
          console.log('Outdated auth file, Updating...') 
          rp(options).then((body) => {
            fs.writeFileSync(authpath,body) 
            checkMember(req, res,user) 
          }) 
        }else{
          checkMember(req, res, user) 
        }
      }else{
        //download new file
        console.log('Downloading auth file') 
        rp(options).then((body) => {
          fs.writeFileSync(authpath,body) 
          checkMember(req, res,user) 
        }) 
      }
    }
  }) 
}) 

//check memeber is docsoc
var checkMember = (req,res,user) => {
  var auth = fs.readFileSync(authpath) 
  var data = JSON.parse(auth).find(el => el.Customer.Login === user) 
  if(data) {
    //VALID USER
    console.log('User ' + user + ' successfully loged in') 
    //setup session
    req.session.docsoc = false 
    req.session.login = true 
    req.session.type = 'member' 
    req.session.data = data.Customer 
    //make folder
    if(!fs.existsSync(__dirname + '/cvs/')){
      fs.mkdirSync(__dirname + '/cvs/') 
    }
    if(!fs.existsSync(__dirname + '/cvs/' + user)){
      fs.mkdirSync(__dirname + '/cvs/' + user) 
    }
    //add filenames to session
    req.session.files = fs.readdirSync(__dirname + '/cvs/' + user) 
    res.redirect('/member') 
  }else{
    //NON DOCSOC USER
    console.log('Not member of DoCSoc') 
    res.render('login', {member: true, error: 'Not a DoCSoc Member!'}) 
  }
}

app.get('/member-login', (req,res) => {
  res.redirect('/') 
})

//SPONSOR AUTH
app.post('/sponsor-login', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'sponsor'){
      res.redirect('/sponsor') 
    }else if(req.session.type == 'member'){
      res.redirect('/member') 
    }
  }else{
    next() 
  }
}, (req,res) => {
  var user = req.body.user 
  var pass = req.body.pass 
  Sponsor.find({username: user}, (err,result) => {
    if(err) return console.log(err) 
    if(result[0] && result[0].password === pass){
      //VALID USER
      console.log('success') 
      req.session.docsoc = false 
      req.session.login = true 
      req.session.type = 'sponsor' 
      req.session.user = user 
      res.redirect('/sponsor') 
    }else{
      res.render('login', {member: false, error: 'Wrong username or password'}) 
    }
  })
}) 

app.get('/sponsor-login', (req,res) => {
  res.redirect('/') 
})

//===========================MEMBER============================

//member PAGE
app.get('/member', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      next() 
    }else if(req.session.type == 'sponsor'){
      res.redirect('/sponsor') 
    }
  }else{
    res.redirect('/') 
  }
}, (req,res) => {
  req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
  renderMember(req,res) 
}) 

//render member
var renderMember = (req,res,err) => {
  Sponsor.find((error, sponsors) => {
    rows = []
    sponsors.forEach(sponsor => {
      sponsor.positions.forEach(position => {
        var row = {
          sponsor: sponsor.name,
          sponsorUsername: sponsor.username,
          position: position.name,
          info: position.info,
          cv: 5
        } 
        var maybeuser = position.users.filter(user => user.username === req.session.data.Login) 
        if(maybeuser.length > 0){
          var user = maybeuser[0] 
          row.cv = req.session.files.indexOf(user.cv) 
        }
        rows.push(row) 
      }) 
    })
    var data = {
      name: req.session.data.FirstName, 
      rows: rows,
      files: req.session.files, 
      error:err
    }
    res.render('member',data) 
  }) 
}

//upload CV
app.post('/upload-cv', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      next() 
    }else if(req.session.type == 'sponsor'){
      res.redirect('/sponsor') 
    }
  }else{
    res.redirect('/') 
  }
},(req,res) => {
  req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
  if (!req.files.file) {
    //check for no file uploaded
    req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
    renderMember(req,res, 'No file uploaded') 
  }else if (!req.body.pdfname){
    //check for no file name
    req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
    renderMember(req,res, 'Invalid File Name') 
  }else if(req.session.files.includes(req.body.pdfname + '.pdf')){
    //check for duplicate file name
    req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
    renderMember(req,res, 'Duplicate File Name') 
  }else{
    let sampleFile = req.files.file 
    sampleFile.mv(__dirname + '/cvs/' + req.session.data.Login + '/' + req.body.pdfname + '.pdf', function(err) {
      if (err) return res.status(500).send(err) 
      req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
      res.redirect('/member') 
    }) 
  }
}) 

//Show CV
app.post('/member-show-cv/:name', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      res.redirect('/member') 
    }else if(req.session.type == 'sponsor'){
      next() 
    }else{
      res.redirect('/') 
    }
  }
},(req,res) => {
  var data = fs.readFileSync(__dirname + '/cvs/' + req.session.data.Login + '/' + req.params.name) 
  res.contentType('application/pdf') 
  res.send(data) 
}) 

//Rename CV
app.post('/rename-cv/:currname', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      next() 
    }else if(req.session.type == 'sponsor'){
      res.redirect('/sponsor') 
    }
  }else{
    res.redirect('/') 
  }
},(req,res) => {
  var path = __dirname + '/cvs/' + req.session.data.Login 
  if(req.session.files.includes(req.body.pdfname + '.pdf')){
    //check for duplicate file name
    req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
    renderMember(req,res, 'Duplicate File Name') 
  }else{
    //rename
    var oldCV = req.params.currname 
    var newCV = req.body.pdfname + '.pdf' 
    fs.renameSync(path  + '/' + oldCV, path  + '/' + newCV) 
    req.session.files = fs.readdirSync(path) 
    
    //remove from sponsor
    Sponsor.find((error, sponsors) => {
      sponsors.forEach(sponsor => {
        sponsor.positions.forEach(position => {
          position.users.forEach(user => {
            if(user.username === req.session.data.Login && user.cv === oldCV) {
              user.cv = newCV 
            }
          }) 
        }) 
        sponsor.save((err, user) => {
          if (err) return next(err)
        })  
      }) 
      res.redirect('/member') 
    }) 
  }
}) 

//Delete CV
app.post('/remove-cv/:name', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      next() 
    }else if(req.session.type == 'sponsor'){
      res.redirect('/sponsor') 
    }
  }else{
    res.redirect('/') 
  }
},(req,res) => {
  //delete file
  fs.unlinkSync(__dirname + '/cvs/' + req.session.data.Login + '/' + req.params.name) 
  req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
  //remove from sponsors
  Sponsor.find((error, sponsors) => {
    sponsors.forEach(sponsor => {
      sponsor.positions.forEach(position => {
        position.users = position.users.filter(user => (user.username !== req.session.data.Login || (user.username === req.session.data.Login && user.cv !== req.params.name))) 
      }) 
      sponsor.save((err, user) => {
        if (err) return next(err)
      }) 
    }) 
  }) 
  res.redirect('/member') 
}) 


//Send CV
app.post('/send-cv', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      next() 
    }else if(req.session.type == 'sponsor'){
      res.redirect('/sponsor') 
    }
  }else{
    res.redirect('/') 
  }
},(req,res) => {
  var data = {
    FirstName: req.session.data.FirstName,
    Surname: req.session.data.Surname,
    email: req.session.data.Email,
    username: req.session.data.Login
  }
  var cvs = [] 
  //manipulating form data
  for(var label in req.body){
    var entry = label.split('-',3)
    var cv = {
      sponsor: entry[0],
      position: entry[1],
      file: entry[2]
    }
    cvs.push(cv) 
  }
  Sponsor.find((err, sponsors) => {
    sponsors.forEach((sponsor) => {
      sponsor.positions.forEach(position => {
        //remove myself
        position.users = position.users.filter(i => i.username !== req.session.data.Login) 
        //if cv chosen, add user data to position
        cvs.forEach(cv => {
          if(cv.file !== 'undefined' && cv.sponsor === sponsor.username && cv.position === position.name){
            data.cv = cv.file 
            position.users.push(data) 
          }
        })
      }) 
      sponsor.save((err, user) => {
        if (err) return next(err)
      })  
    }) 
  }) 
  res.redirect('/member') 
}) 

//===========================SPONSOR========================

//sponsor PAGE
app.get('/sponsor', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'sponsor'){
      next() 
    }else if(req.session.type == 'member'){
      res.redirect('/member') 
    }
  }else{
    res.redirect('/') 
  }
}, (req,res) => {
  Sponsor.find({username: req.session.user},(err, sponsor) => {
    res.render('sponsor', {name: sponsor[0].name, positions: sponsor[0].positions})
  }) 
}) 

//sponsor Show CV
app.post('/sponsor-show-cv/:path/:name', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      res.redirect('/member') 
    }else if(req.session.type == 'sponsor'){
      next() 
    }else{
      res.redirect('/') 
    }
  }
},(req,res) => {
  var data = fs.readFileSync(__dirname + '/cvs/' + req.params.path + '/' + req.params.name) 
  res.contentType('application/pdf') 
  res.send(data) 
}) 

//Add new Position
app.post('/add-position', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      res.redirect('/member') 
    }else if(req.session.type == 'sponsor'){
      next() 
    }else{
      res.redirect('/') 
    }
  }
},(req,res) => {
  Sponsor.find({username: req.session.user} , (err, sponsor) => {
    if (err) return next(err) 
    if(!sponsor[0].positions.some(position => position.name === req.body.name)){
      var data = {
        name: req.body.name,
        info: req.body.info,
        users: []
      }
      sponsor[0].positions.push(data) 
      sponsor[0].save((err, user) => {
        if (err) return next(err) 
        res.redirect('/sponsor')
      }) 
    }else{
      res.render('sponsor', {name: sponsor[0].name, positions: sponsor[0].positions, error: "Position name already exists"})
    }
  }) 
}) 

//Remove Position
app.post('/remove-position/:name', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      res.redirect('/member') 
    }else if(req.session.type == 'sponsor'){
      next() 
    }else{
      res.redirect('/') 
    }
  }
},(req,res) => {
  Sponsor.find({username: req.session.user} , (err, sponsor) => {
    if (err) return next(err) 
    sponsor[0].positions = sponsor[0].positions.filter(position => position.name !== req.params.name) 
    sponsor[0].save((err, user) => {
      if (err) return next(err) 
      res.redirect('/sponsor')
    }) 
  }) 
}) 

// ==============PORTAL===================

//PORTAL LOGIN PAGE
app.get('/portal-login', (req,res) => {
  res.render('portal-login') 
}) 

//portal auth
app.post('/portal-login', (req,res,next) => {
  if(req.session.docsoc){
    res.redirect('/portal') 
  }else{
    next() 
  }
}, (req,res) => {
  var user = req.body.user 
  var pass = req.body.pass 
  if(user === 'docsoc' && pass === 'docsoc'){
    req.session.docsoc = true 
    res.redirect('/portal') 
  }else{
    res.redirect('/') 
  }
})

//PORTAL PAGE
app.get('/portal', (req,res,next) => {
  if(req.session.docsoc){
    next() 
  }else{
    res.redirect('/portal-login') 
  }
}, (req,res) => {
  Sponsor.find((err, s) => {
    res.render('portal', {sponsors: s}) 
  })
}) 

//Add new sponsor
app.post('/new-sponsor', (req,res) => {
  //make sponsor
  var sponsor = new Sponsor({
    username: req.body.user,
    name: req.body.name,
    password: req.body.pass,
    rank: req.body.rank,
    posts: [],
    positions: []
  }) 
  //save sponsor
  sponsor.save((err, user) => {
    if (err) {
      return next(err)
    } else {
      res.redirect('/portal') 
    }
  }) 
}) 

//Remove Sponsor
app.post('/remove-sponsor/:user', (req,res) => {
  Sponsor.remove({username: req.params.user} , (err) => {
    if (err) {
      return next(err)
    } else {
      res.redirect('/portal') 
    }
  }) 
}) 

//====================OTHER======================

//LOGOUT
app.post('/logout', (req,res) => {
  req.session.destroy() 
  res.redirect('/') 
}) 


//SERVER LISTEN
app.listen(app.get('port'), function(){
  console.log('Server listening on port ' + app.get('port')) 
})                             
