const mongoose = require('mongoose') 

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
exports.Sponsor = mongoose.model('Sponsor', SponsorSchema) 
