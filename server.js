const express = require('express');
const expressKerberos = require('express-kerberos');

const app = express();

app.get('/', expressKerberos(), (req, res) => {
  res.send('Hello ${req.auth.username}!');
});

