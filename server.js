const express = require('express');
const session = require('express-session');
const util = require('util')
const krb5 = require('node-krb5')
const rp = require('request-promise');

//EXPRESS APP
const app = express();

//PORT
app.set('port', process.env.PORT || 8080);

//JSON PARSER
app.use(express.urlencoded({extended: false})); 
app.use(express.json());   

//SESSION
app.use(session({
  secret: 'keyboard cat',
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
  res.sendFile('public/login.html', {root: __dirname });
});


//LOGIN member FORM
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
    }else{
      //REQUEST EACTIVITIES AND CHECK IF DOCSOC MEMBER
      rp(options).then((body) => {
        var data = JSON.parse(body).find(el => el.Customer.Login === user);
        if(data) {
          //VALID USER
          console.log('success');
          req.session.login = true;
          req.session.type = 'member';
          req.session.name = data.Customer.FirstName;
          res.redirect('/member');
        }else{
          //NON DOCSOC USER
          console.log('not member of DoCSoc');
          res.send("Not a DoCSoc Member!");
        }
      });
    }
  });
});

app.post('/member-login', (req,res) => {

});


//member PAGE
app.get('/member', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      next();
    }else{
      res.redirect('/sponsor');
    }
  }else{
    res.redirect('/');
  }
}, (req,res) => {
  //console.log(req.session);
  //res.sendFile('public/member.html', {root: __dirname });
  res.write('<html><head></head><body><form method="post"><input type="submit"/></form>');
  res.write('Hello member ' + req.session.name + '</body></html>');
  res.end();
});

app.post('/member', (req,res) => {
  req.session.destroy();
  res.redirect('/');
});


//sponsor PAGE
app.get('/sponsor', (req,res,next) => {
  if(req.session.login){
    if(req.session.type == 'sponsor'){
      next();
    }else{
      res.redirect('/member');
    }
  }else{
    res.redirect('/');
  }
}, (req,res) => {
  //console.log(req.session);
  //res.sendFile('public/member.html', {root: __dirname });
  res.write('Hello Sponsor ' + req.session.name);
  res.write('<form method="post"><input type="submit"/></form>');
  res.end();
});


//SERVER LISTEN
app.listen(app.get('port'), function(){
  console.log('Server listening on port ' + app.get('port'));
});                            
