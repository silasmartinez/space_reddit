var Rooter = require('rooter-router'),
  fs = require('fs'),
  db = require('monk')('localhost/space'),
  users = db.get('users'),
  faves = db.get('faves'),
  qs = require('qs'),
  mime = require('mime'),
  bcrypt = require('bcryptjs'),
  bars = require('handlebars'),
  router = new Rooter

function prep (file, obj, res) {
  res.setHeader('Content-Type', 'text/html')
  var file = fs.readFileSync(file)
  var template = bars.compile(file.toString())(obj)
  res.end(template)
}

router.add('/faves', (req, res, url) => {
  if (req.session.get('email')) {
    console.log('success')


      faves.find({user: req.session.get('email')}, (err, docs) => {
        if (err) {
          console.log(err)
          res.end('DB encountered an error')
        }
        obj = {
          'faves': docs,
          'username': req.session.get('email')
        }
        prep('templates/site/faves.html', obj, res)
      })
  } else {
    req.session.flush()
    res.writeHead(302, {'Location': '/'})
    res.end()
  }
}, 'GET')

router.add('/faves', (req, res, url) => {
  console.log('faves post')
  console.log(req.session.get('email'))
  var data = ''
  req.on('data', function (chunk) {
    data += chunk
  })
  req.on('end', function () {
    var fave = qs.parse(data)
    console.log(fave)
    fave.user = req.session.get('email')
    faves.insert(fave, function (err, doc) {
      if (err) {
        console.log('err: ', err)
        res.writeHead(302, {'Location': '/'})
        res.end()
        return
      }
      res.writeHead(302, {'Location': '/'})
      res.end()
    })
  })
}, 'POST')

router.add('/', (req, res, url) => {
  var obj = {}
  if (req.session.get('email')) {
     obj = {username: req.session.get('email')}
  }
  console.log(obj)
  prep('templates/site/index.html', obj, res)
})

router.add('/register', (req, res, url) => {
  prep('templates/sessions/register.html', {}, res)
}, 'GET')

router.add('/register', (req, res, url) => {
  var data = ''
  req.on('data', function (chunk) {
    data += chunk
  })
  req.on('end', function () {
    var user = qs.parse(data)
    console.log(user)
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10))
    console.log(user)
    users.insert(user, function (err, doc) {
      if (err) {
        console.log('err: ', err)
        res.writeHead(302, {'Location': '/'})
        res.end()
        return
      }
      req.session.put('email', doc.email)
      res.writeHead(302, {'Location': '/'})
      res.end()
    })
  })
}, 'POST')

router.add('/login', (req, res, url) => {
  prep('templates/sessions/login.html', {}, res)
}, 'GET')
router.add('/login', (req, res, url) => {
  var data = ''
  req.on('data', function (chunk) {
    data += chunk
  })

  req.on('end', function () {
    var user = qs.parse(data)
    console.log(user)
    users.findOne({email: user.email}, function (err, doc) {
      console.log(doc)
      if (err || !doc) {
        res.writeHead(302, {'Location': '/'})
        res.end()
        return
      }
      if (bcrypt.compareSync(user.password, doc.password)) {
        req.session.put('email', doc.email)
        res.writeHead(302, {'Location': '/'})
        res.end()
      } else {
        //handle bad password
        res.end('Bad login!')
      }
    })
  })

}, 'POST')

router.add('/logout', (req, res, url) => {
  req.session.flush()

  res.writeHead(302, {'Location': '/faves'})
  res.end()
})

router.add('/*', (req, res, url) => {
  res.setHeader('Content-Type', mime.lookup(req.url))
  fs.readFile('./public/' + req.url, function (err, file) {
    if (err) {
      res.setHeader('Content-Type', 'text/html')
      res.end('404')
    }
    res.end(file)
  })
})

module.exports = router
