const express = require('express')
const session = require('express-session')
const fileUpload = require('express-fileupload')
const helmet = require('helmet')
const fs = require('fs')

const app = express()

app.set('view engine', 'pug')
app.set('views', './views')

app.use(helmet())
app.use('/static', express.static('./static'))

app.use(fileUpload())

// PORT
app.set('port', process.env.PORT || 80)

// JSON PARSER
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// SESSION
app.use(session({
  secret: 'shhhhhhhhhhhh',
  resave: false,
  saveUninitialized: true
}))

if (!fs.existsSync('./sponsors/')) {
  fs.mkdirSync('./sponsors/')
}

if (!fs.existsSync('./temp/')) {
  fs.mkdirSync('./temp/')
}

if (!fs.existsSync('./secure/')) {
  fs.mkdirSync('./secure/')
}

exports.app = app
