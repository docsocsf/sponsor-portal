const krb5 = require('node-krb5')
const rp = require('request-promise') 
const fs = require('fs') 

const authpath = __dirname + '/auth.json' 

exports.authSponsor = (user, pass, db, session, callback) => {
  db.Sponsor.find({username: user}, (err,result) => {
    if(err) return logger.info(err) 
    if(result[0] && result[0].password === pass){
      //VALID USER
      logger.info('success') 
      session.docsoc = false 
      session.login = true 
      session.type = 'sponsor' 
      session.user = user 
      callback(true)
    }else{
      callback({member: false, err: 'Wrong username or password'}) 
    }
    return
  })
}

//EACTIVITIES PORTAL
var options = {
  //Change this to get correct auth
  url: 'https://eactivities.union.ic.ac.uk/API/CSP/605/reports/members',
  auth: {
    user: 'user',
    password: '03CB83E3-AF2E-4528-98D2-20046AED475A'
  }
}

exports.authUser = (user, pass, session, callback) => {
  //for debugging
  logger.info('User ' + user + ' trying to login...') 
  //KERBEROS AUTHENTICATION
  logger.info('starting Kerberos Authentication...') 
  krb5.authenticate(user + '@IC.AC.UK' , pass, (err) => {
    if(err){
      //WRONG PASSWORD/INVALID USER
      logger.info('err ' + err) 
      //res.send('wrong username or password') 
      callback( {member: true, err: 'Wrong username or password'} )
      return
    }else{
      logger.info('Kerberos Authentication success.') 
      logger.info('Starting DoCSoc Member Check...') 
      //REQUEST EACTIVITIES if auth file older than 24 hours
      if (fs.existsSync(authpath)) {
        var stat = fs.statSync(authpath) 
        if (err) {
          return console.error(err) 
        }
        var now = new Date().getTime() 
        //86400000 ms is 24 hours
        var endTime = new Date(stat.ctime).getTime() + 86400000 
        if (now > endTime) {
          //download new file
          logger.info('Outdated auth file, Updating...') 
          rp(options).then((body) => {
            fs.writeFileSync(authpath,body) 
            return checkMember(session,user, callback)
          }) 
        }else{
          return checkMember(session, user, callback)
        }
      }else{
        //download new file
        rp(options).then((body) => {
          logger.info('Downloading auth file')
          fs.writeFileSync(authpath,body) 
          return checkMember(session,user,callback) 
        }) 
      }
    }
  }) 
}

//check memeber is docsoc
checkMember = (session, user, callback) => {
  var auth = fs.readFileSync(authpath) 
  var data = JSON.parse(auth).find(el => el.Login === user) 
  if(data) {
    //VALID USER
    logger.info('User ' + user + ' successfully loged in') 
    //setup session
    session.docsoc = false 
    session.login = true 
    session.type = 'member' 
    session.data = data 
    //make folder
    callback(true)
    return
  }else{
    //NON DOCSOC USER
    logger.info('Not member of DoCSoc') 
    callback( {member: true, err: 'Not a DoCSoc Member!'} )
    return
  }
}
