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
  const AWS = require('aws-sdk')
  const s3 = require('s3')
  var awsS3Client = new AWS.S3()
  var options = {
    s3Client: awsS3Client,
  };
  var client = s3.createClient(options)
  var params = {
    localDir: mainsponsorpath,
    deleteRemoved: false,
    s3Params: {
      Bucket: "icdocsoc-sponsor-portal",
      Prefix: "sponsors/" 
    }
  }
  var uploader = client.downloadDir(params)
  logger.info("[S3] Starting Download")
  uploader.on('error', function (err) {
    logger.error("Failed to update from s3:", err.stack)
  })
  uploader.on('end', function () {
    logger.info("[S3] Finished Download")
  })
}

const app = express()

app.set('view engine', 'pug')
app.set('views', './views')

app.use(helmet())
app.use(Morgan('combined'))
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


exports.app = app