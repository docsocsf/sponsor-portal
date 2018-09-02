// setup express app
const setup = require('./src/setup.js')
const app = setup.app

// setup mongoDB database
const db = require('./src/db.js')

//= =========================LOGIN PAGE======================
const login = require('./src/login.js')
login.setup(app, db)

//= ==========================MEMBER=========================

const member = require('./src/member.js')
member.setup(app, db)

//= ==========================SPONSOR========================

const sponsor = require('./src/sponsor.js')
sponsor.setup(app, db)

//= ==========================PORTAL=========================

const portal = require('./src/portal.js')
portal.setup(app, db)

//= ===========================OTHER=========================

// LOGOUT
app.post('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

app.get('*', function (req, res) {
  res.redirect('/login')
})

// SERVER LISTEN
app.listen(app.get('port'), function () {
  console.log('Server listening on port ' + app.get('port'))
})
