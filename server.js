const express = require('express');
const  {default: expressKerberos}  = require('express-kerberos');

const app = express();

app.get('/', expressKerberos(), (req, res) => {
  res.send('Hello ${req.auth.username}!');
});

