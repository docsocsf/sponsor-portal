const fs = require('fs')

var check = (req,res, callback) => {
  if(req.session.login){
    if(req.session.type == 'member'){
      callback()
    }else if(req.session.type == 'sponsor'){
      res.redirect('/sponsor') 
    }
  }else{
    res.redirect('/') 
  }
}

exports.setup = (app, db) => {

  //member PAGE
  app.get('/member', (req,res,next) => {
    check(req,res,next)
  }, (req,res) => {
    renderMember(req,res) 
  }) 

  //render member
  var renderMember = (req,res,err) => {
    db.Sponsor.find((error, sponsors) => {
      ss = []
      sponsors.forEach(sponsor => {
        s = {
          username: sponsor.username,
          info: sponsor.info,
          news: sponsor.news,
          positions: []
        }
        sponsor.positions.forEach(position => {
          var pos = {
            name: position.name,
            description: position.description,
            requirements: position.requirements,
            link: position.link,
            applied: false
          }
          var maybeuser = position.users.filter(user => user.username === req.session.data.Login) 
          if(maybeuser.length > 0){
            var user = maybeuser[0]
            pos.applied = true 
            pos.email = user.email
            pos.documents = user.documents
          }
          s.positions.push(pos) 
        })
        ss.push(s);
      })
      var data = {
        name: req.session.data.FirstName, 
        email: req.session.data.Email,
        sponsors: ss,
        error:err
      }
      res.render('member',data) 
    }) 
  }

  app.post('/member/apply/:sponsor/:posname', (req,res,next) => {
    check(req,res,next)
  }, (req,res) => {
    db.Sponsor.find({username: req.params.sponsor} , (err, sponsor) => {
      if (err) return next(err)
      data = {
        firstname: req.session.data.FirstName,
        surname: req.session.data.Surname,
        email:req.body.email,
        username: req.session.data.Login,
        documents: []
      }
      for(let i=0; i<10; i++){
        if(req.files['document'+i]){
          //Implement check names
          req.files['document'+i].mv('directory/' + req.files['document'+i].name, function(err) {
            if (err) return res.status(500).send(err) 
          }) 
        } 
      }
      renderMember(req,res) 
    })
  })

  app.get('/member/apply/:sponsor/:posname', (req,res,next) => {
    check(req,res,next)
  }, (req,res) => { 
    res.redirect('/')
  })
}