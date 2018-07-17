const express = require('express');
var util = require('util')
var krb5 = require('node-krb5')
var rp = require('request-promise');

const app = express();

app.set('port', process.env.PORT || 8080);

app.use(express.static(__dirname + '/public'));

app.use(express.urlencoded({extended: false})); 
app.use(express.json());   


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
  res.sendFile('index.html');
});

app.post('/login', (req,res) => {
  var user = req.body.user;
  var pass = req.body.pass;
  console.log('User ' + user + ' trying to login');
  krb5.authenticate(user + "@IC.AC.UK" ,pass, (err, stuff) => {
    if(err){
      console.log('err ' + err);
      res.send('wrong username or password');
    }else{
      rp(options).then((body) => {
        var data = JSON.parse(body);
        if(data.find(el => el.Customer.Login === user)) {
          console.log('good');
          res.redirect('/studet');
        }else{
          console.log('not member of DoCSoc');
        }
      });
    }
  });
});

app.listen(app.get('port'), function(){
  console.log('Server listening on port ' + app.get('port'));
});                            
