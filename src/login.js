const auth = require('../auth/auth.js')

var check = (req,res, callback) => {
  if(req.session.login){
    if(req.session.type == 'sponsor'){
      res.redirect('/sponsor') 
    }else if(req.session.type == 'member'){
      res.redirect('/member') 
    }
  }else{
    callback()
  }
}

exports.setup = (app, db) => {

  app.get('/',  (req,res,next) => {
    check(req,res,next)
  }, (req,res) => {
    res.render('login' , {member: true}) 
  }) 
  
  //MEMBER AUTH
  app.post('/member-login', (req,res,next) => {
    check(req,res,next)
  }, (req,res) => {
    var user = req.body.user 
    var pass = req.body.pass 
    auth.authUser(user, pass, req.session, (ret) => {
      (ret === true) ? 
      res.redirect('/member') : 
      res.render('login', ret)
    })
  }) 
  
  app.get('/member-login',(req,res,next) => {
    check(req,res,next)
  }, (req,res) => {
    res.redirect('/') 
  })
  
  //SPONSOR AUTH
  app.post('/sponsor-login',(req,res,next) => {
    check(req,res,next)
  }, (req,res) => {
    var user = req.body.user 
    var pass = req.body.pass 
    auth.authSponsor(user,pass,db,req.session, (ret) => {
      (ret === true) ? 
      res.redirect('/sponsor') : 
      res.render('login', ret) 
    })
  }) 
  
  app.get('/sponsor-login', (req,res,next) => {
    check(req,res,next)
  }, (req,res) => {
    res.redirect('/') 
  })
}