'use strict'
const mongoose = require('mongoose')
const logger = require('./logger.js')
const args = require('args-parser')(process.argv)

// MONGOOSE
if (args['dev']) {
  mongoose.connect('mongodb://127.0.0.1:27017/portalsample', {
    useNewUrlParser: true
  })
} else {
  mongoose.connect('mongodb://127.0.0.1:27017/portal', {
    useNewUrlParser: true
  })
}
var db = mongoose.connection
db.on('error', function (err) {
  logger.error('Failed to connect to mongodb: ' + err)
})
db.once('open', function () {
  logger.info('Connected to mongodb')
})

// DATABASE SCHEME
var SponsorSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
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
    },
    love: {
      type: Number,
      min: 0
    }
  }],
  positions: [{
    name: {
      type: String
    },
    description: {
      type: String
    },
    link: {
      type: String
    },
    apply_local: {
      type: Boolean
    },
    apply_link: {
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