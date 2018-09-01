const mongoose = require('mongoose') 

//MONGOOSE
mongoose.connect('mongodb://146.169.46.89/portal') 
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
  password: {
    type: String,
    required: true,
  },
  info: {
    name: {
      type: String
    },
    email: {
      type: String
    },
    rank: {
      type: String
    },
    bespoke: {
      type: Boolean
    },
    description: {
      type: String
    },
    picture: {
      type: String
    },
    link: {
      type: String
    }
  },
  news: [{
    date: {
      type: String
    },
    title: {
      type: String
    },
    text: {
      type: String
    },
    link: {
      type: String
    }
  }],
  positions: [{
    name: {
      type: String
    },
    description: {
      type: String
    },
    requirements: {
      type: String
    },
    link: {
      type: String
    },
    users: [{
      firstname: {
        type: String
      },
      surname: {
        type: String
      },
      email: {
        type: String
      },
      username: {
        type: String
      },
      documents: [{
        name: {
          type: String
        }
      }]
    }]
  }]
}) 
exports.Sponsor = mongoose.model('Sponsor', SponsorSchema) 
