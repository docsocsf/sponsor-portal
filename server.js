const express = require('express');
var util = require('util')
var krb5 = require('node-krb5')
var bodyParser = require("body-parser");
var request = require('request');

const app = express();

app.set('port', process.env.PORT || 8080);

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
  extend:false
}));


var username = 'user';
var password = '03CB83E3-AF2E-4528-98D2-20046AED475A';
var options = {
  url: 'https://eactivities.union.ic.ac.uk/API/CSP/605/reports/onlinesales?year=17-18',
  auth: {
    user: username,
    password: password
  }
}

app.get('/login', (req,res) => {
  res.sendFile('login.html');
});

app.post('/login', (req,res) => {
  var user = req.body.user;
  var pass = req.body.pass;
  console.log('User ' + user + ' trying to login');
  krb5.authenticate(user + "@IC.AC.UK" ,pass, (err, stuff) => {
    console.log(stuff);
    if(err){
      console.log('err ' + err);
      res.send('wrong username or password');
    }else{
      request(options, function (err, rs, body) {
        var info = [];
        if (!err) {
          JSON.parse(body).forEach(e => {
            if(user == e.Customer.Login){
              console.log('good');
              res.send('success');
              return;
            }
          });
        }
        console.dir(err);
        return;
      });
    }
  });
});

app.listen(app.get('port'), function(){
  console.log('Server listening on port ' + app.get('port'));
});                            