'use strict'
const express = require('express')
const session = require('express-session')
const fileUpload = require('express-fileupload')
const helmet = require('helmet')
const fs = require('fs')
const logger = require('./logger.js')
const Morgan = require('morgan')
const args = require('args-parser')(process.argv)
const config = require('./config.js')

var mainsponsorpath
if (args['dev']) {
  mainsponsorpath = './samplesponsors/'
} else {
  mainsponsorpath = './sponsors/'
}

const app = express()

app.set('view engine', 'pug')
app.set('views', './views')

app.use(helmet())
app.use(Morgan({
  'stream': logger.stream
}))
app.use('/', express.static('./static'))

app.use(fileUpload())

// PORT
app.set('port', process.env.PORT || 8080)

// JSON PARSER
app.use(express.urlencoded({
  extended: false
}))
app.use(express.json())

// SESSION
app.use(session({
  secret: (config.doc) ? config.doc.sessions : "shhhhhhhhh",
  resave: false,
  saveUninitialized: true
}))

if (!fs.existsSync(mainsponsorpath)) {
  fs.mkdirSync(mainsponsorpath)
}

if (!fs.existsSync('./temp/')) {
  fs.mkdirSync('./temp/')
}

if (!fs.existsSync('./secure/')) {
  fs.mkdirSync('./secure/')
}

exports.app = app
