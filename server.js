//setup express app
const setup = require('./setup.js')
const app = setup.app

//setup mongoDB database
const db = require('./db.js')

//==========================LOGIN PAGE======================
const login = require('./login.js')
login.setup(app, db)

//===========================MEMBER=========================

const member = require('./member.js')
member.setup(app, db)

//===========================SPONSOR========================

const sponsor = require('./sponsor.js')
sponsor.setup(app, db)

//===========================PORTAL=========================
  
const portal = require('./portal.js')
portal.setup(app, db)

//============================OTHER=========================

//LOGOUT
app.post('/logout', (req,res) => {
  req.session.destroy() 
  res.redirect('/') 
}) 


//SERVER LISTEN
app.listen(app.get('port'), function(){
  console.log('Server listening on port ' + app.get('port')) 
})                             
