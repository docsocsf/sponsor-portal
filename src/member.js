const fs = require('fs-extra')

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
        err:error
      }
      res.render('member',data) 
    })  
  }) 

  //apply
  app.post('/member/apply/:sponsor/:posname', (req,res,next) => {
    check(req,res,next)
  }, (req,res) => {
    db.Sponsor.find({username: req.params.sponsor} , (err, sponsor) => {
      if (err) return
      var path = './sponsors/'+ req.params.sponsor + '/' + req.params.posname + '/' + req.session.data.FirstName + ' ' + req.session.data.Surname + ' ' + req.session.data.Login + '/'
      data = {
        firstname: req.session.data.FirstName,
        surname: req.session.data.Surname,
        email:req.body.email,
        username: req.session.data.Login,
        documents: []
      }
      if(!fs.existsSync(path)){
        fs.mkdirSync(path) 
      }
      for(let i=0; i<10; i++){
        if(req.files['document'+i]){
          //Implement check names
          var ext = req.files['document'+i].name.split('.').pop();
          req.files['document'+i].mv(path + req.body['documentname'+i] + '.' + ext, function(err) {
            if (err) return res.status(500).send(err) 
          }) 
          data.documents.push({
            name: req.body['documentname'+i] + '.' + ext
          })
        } 
      }
      sponsor[0].positions.forEach(position => {
        if(position.name === req.params.posname){
          position.users.push(data)
        }
      });
      sponsor[0].save((err, user) => {
        if (err) return 
        res.redirect('/member')
      }) 
    })
  })
  app.get('/member/apply/:sponsor/:posname', (req,res,next) => {
    check(req,res,next)
  }, (req,res) => { 
    res.redirect('/member')
  })


  //unapply
  app.post('/member/unapply/:sponsor/:posname', (req,res,next) => {
    check(req,res,next)
  }, (req,res) => {
    db.Sponsor.find({username: req.params.sponsor} , (err, sponsor) => {
      if (err) return
      var path = './sponsors/'+ req.params.sponsor + '/' + req.params.posname + '/' + req.session.data.FirstName + ' ' + req.session.data.Surname + ' ' + req.session.data.Login + '/'
      if(fs.existsSync(path)){
        fs.removeSync(path) 
      }
      sponsor[0].positions.forEach(position => {
        if(position.name === req.params.posname){
          position.users = position.users.filter(user => user.username !== req.session.data.Login) 
        }
      });
      sponsor[0].save((err, user) => {
        if (err) return 
        res.redirect('/member')
      }) 
    })
  })
}