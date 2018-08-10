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
    req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
    renderMember(req,res) 
  }) 

  //render member
  var renderMember = (req,res,err) => {
    db.Sponsor.find((error, sponsors) => {
      rows = []
      sponsors.forEach(sponsor => {
        sponsor.positions.forEach(position => {
          var row = {
            sponsor: sponsor.name,
            sponsorUsername: sponsor.username,
            position: position.name,
            info: position.info,
            cv: 5
          } 
          var maybeuser = position.users.filter(user => user.username === req.session.data.Login) 
          if(maybeuser.length > 0){
            var user = maybeuser[0] 
            row.cv = req.session.files.indexOf(user.cv) 
          }
          rows.push(row) 
        }) 
      })
      var data = {
        name: req.session.data.FirstName, 
        rows: rows,
        files: req.session.files, 
        error:err
      }
      res.render('member',data) 
    }) 
  }

  //upload CV
  app.post('/upload-cv', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
    if (!req.files.file) {
      //check for no file uploaded
      req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
      renderMember(req,res, 'No file uploaded') 
    }else if (!req.body.pdfname){
      //check for no file name
      req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
      renderMember(req,res, 'Invalid File Name') 
    }else if(req.session.files.includes(req.body.pdfname + '.pdf')){
      //check for duplicate file name
      req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
      renderMember(req,res, 'Duplicate File Name') 
    }else{
      let sampleFile = req.files.file 
      sampleFile.mv(__dirname + '/cvs/' + req.session.data.Login + '/' + req.body.pdfname + '.pdf', function(err) {
        if (err) return res.status(500).send(err) 
        req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
        res.redirect('/member') 
      }) 
    }
  }) 

  //Show CV
  app.post('/member-show-cv/:name', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    var data = fs.readFileSync(__dirname + '/cvs/' + req.session.data.Login + '/' + req.params.name) 
    res.contentType('application/pdf') 
    res.send(data) 
  }) 

  //Rename CV
  app.post('/rename-cv/:currname', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    var path = __dirname + '/cvs/' + req.session.data.Login 
    if(req.session.files.includes(req.body.pdfname + '.pdf')){
      //check for duplicate file name
      req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
      renderMember(req,res, 'Duplicate File Name') 
    }else{
      //rename
      var oldCV = req.params.currname 
      var newCV = req.body.pdfname + '.pdf' 
      fs.renameSync(path  + '/' + oldCV, path  + '/' + newCV) 
      req.session.files = fs.readdirSync(path) 
      
      //remove from sponsor
      db.Sponsor.find((error, sponsors) => {
        sponsors.forEach(sponsor => {
          sponsor.positions.forEach(position => {
            position.users.forEach(user => {
              if(user.username === req.session.data.Login && user.cv === oldCV) {
                user.cv = newCV 
              }
            }) 
          }) 
          sponsor.save((err, user) => {
            if (err) return next(err)
          })  
        }) 
        res.redirect('/member') 
      }) 
    }
  }) 

  //Delete CV
  app.post('/remove-cv/:name', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    //delete file
    fs.unlinkSync(__dirname + '/cvs/' + req.session.data.Login + '/' + req.params.name) 
    req.session.files = fs.readdirSync(__dirname + '/cvs/' + req.session.data.Login) 
    //remove from sponsors
    db.Sponsor.find((error, sponsors) => {
      sponsors.forEach(sponsor => {
        sponsor.positions.forEach(position => {
          position.users = position.users.filter(user => (user.username !== req.session.data.Login || (user.username === req.session.data.Login && user.cv !== req.params.name))) 
        }) 
        sponsor.save((err, user) => {
          if (err) return next(err)
        }) 
      }) 
    }) 
    res.redirect('/member') 
  }) 


  //Send CV
  app.post('/send-cv', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    var data = {
      FirstName: req.session.data.FirstName,
      Surname: req.session.data.Surname,
      email: req.session.data.Email,
      username: req.session.data.Login
    }
    var cvs = [] 
    //manipulating form data
    for(var label in req.body){
      var entry = label.split('-',3)
      var cv = {
        sponsor: entry[0],
        position: entry[1],
        file: entry[2]
      }
      cvs.push(cv) 
    }
    db.Sponsor.find((err, sponsors) => {
      sponsors.forEach((sponsor) => {
        sponsor.positions.forEach(position => {
          //remove myself
          position.users = position.users.filter(i => i.username !== req.session.data.Login) 
          //if cv chosen, add user data to position
          cvs.forEach(cv => {
            if(cv.file !== 'undefined' && cv.sponsor === sponsor.username && cv.position === position.name){
              data.cv = cv.file 
              position.users.push(data) 
            }
          })
        }) 
        sponsor.save((err, user) => {
          if (err) return next(err)
        })  
      }) 
    }) 
    res.redirect('/member') 
  }) 
}