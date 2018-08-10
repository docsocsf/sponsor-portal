const auth = require('./auth.js')

exports.setup = (app, db) => {
  app.get('/',  (req,res,next) => {
    if(req.session.login){
      (req.session.type == 'sponsor') ? 
      res.redirect('/sponsor') : 
      res.redirect('/member') 
    }else{
      next() 
    }
  },(req,res) => {
    res.render('login' , {member: true}) 
  }) 
  
  //MEMBER AUTH
  app.post('/member-login', (req,res,next) => {
    if(req.session.login){
      if(req.session.type == 'sponsor'){
        res.redirect('/sponsor') 
      }else if(req.session.type == 'member'){
        res.redirect('/member') 
      }
    }else{
      next() 
    }
  }, (req,res) => {
    var user = req.body.user 
    var pass = req.body.pass 
    auth.authUser(user, pass, req.session, (ret) => {
      (ret === true) ? 
      res.redirect('/member') : 
      res.render('login', ret)
    })
  }) 
  
  app.get('/member-login', (req,res) => {
    res.redirect('/') 
  })
  
  //SPONSOR AUTH
  app.post('/sponsor-login', (req,res,next) => {
    if(req.session.login){
      if(req.session.type == 'sponsor'){
        res.redirect('/sponsor') 
      }else if(req.session.type == 'member'){
        res.redirect('/member') 
      }
    }else{
      next() 
    }
  }, (req,res) => {
    var user = req.body.user 
    var pass = req.body.pass 
    auth.authSponsor(user,pass,db,req.session, (ret) => {
      (ret === true) ? 
      res.redirect('/sponsor') : 
      res.render('login', ret) 
    })
  }) 
  
  app.get('/sponsor-login', (req,res) => {
    res.redirect('/') 
  })
}