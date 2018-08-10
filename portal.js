exports.setup = (app, db) => {

  //PORTAL LOGIN PAGE
  app.get('/portal-login', (req,res) => {
    res.render('portal-login') 
  }) 

  //portal auth
  app.post('/portal-login', (req,res,next) => {
    if(req.session.docsoc){
      res.redirect('/portal') 
    }else{
      next() 
    }
  }, (req,res) => {
    var user = req.body.user 
    var pass = req.body.pass 
    if(user === 'docsoc' && pass === 'docsoc'){
      req.session.docsoc = true 
      res.redirect('/portal') 
    }else{
      res.redirect('/') 
    }
  })

  //PORTAL PAGE
  app.get('/portal', (req,res,next) => {
    if(req.session.docsoc){
      next() 
    }else{
      res.redirect('/portal-login') 
    }
  }, (req,res) => {
    db.Sponsor.find((err, s) => {
      res.render('portal', {sponsors: s}) 
    })
  }) 

  //Add new sponsor
  app.post('/new-sponsor', (req,res) => {
    //make sponsor
    var sponsor = new db.Sponsor({
      username: req.body.user,
      name: req.body.name,
      password: req.body.pass,
      rank: req.body.rank,
      posts: [],
      positions: []
    }) 
    //save sponsor
    sponsor.save((err, user) => {
      if (err) {
        return next(err)
      } else {
        res.redirect('/portal') 
      }
    }) 
  }) 

  //Remove db.Sponsor
  app.post('/remove-sponsor/:user', (req,res) => {
    db.Sponsor.remove({username: req.params.user} , (err) => {
      if (err) {
        return next(err)
      } else {
        res.redirect('/portal') 
      }
    }) 
  }) 
}