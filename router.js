var Rooter = require('rooter-router'),
  fs = require('fs'),
  db = require('monk')('localhost/music'),
  users = db.get('users'),
  qs = require('qs'),
  view = require('./view'),
  mime = require('mime'),
  bcrypt = require('bcryptjs'),
  router = new Rooter



router.add('/faves', (req, res, url) => {
  console.log('admin')
  if (req.session.get('email')) {
    console.log('success')
    var template = view.render('site/private')
    res.end(template)
  } else {
    req.session.flush()
    res.writeHead(302, {'Location': '/'})
    res.end()
  }

}, 'GET')

router.add('/faves', (req, res, url) => {

},'PUT')

router.add('/', (req, res, url) => {
  // Render the homepage
  var template = view.render('site/index', {})
  res.end(template)
})

router.add('/register', (req, res, url) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    var template = view.render('sessions/register', {title: 'Log In'})
    res.end(template)
  }
  if (req.method === 'POST') {
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
  }
})

router.add('/login', (req, res, url) => {
  if (req.method === 'GET') {
    // 1. Render the login page with the view module
    var template = view.render('sessions/login', {})
    res.end(template)

  }
  if (req.method === 'POST') {
    var data = ''

    req.on('data', function (chunk) {
      data += chunk
    })

    req.on('end', function () {
      var user = qs.parse(data)
      console.log(user)
      users.findOne({email: user.email}, function (err, doc) {
        console.log(doc)
        if (err || ! doc) {
          res.writeHead(302, {'Location': '/'})
          res.end()
          return
        }
        if (bcrypt.compareSync(user.password, doc.password)) {
          req.session.put('email', doc.email)
          res.writeHead(302, {'Location': '/admin'})
          res.end()
        } else {
          //handle bad password
        }
      })
    })
  }
})

router.add('/logout', (req, res, url) => {
  // 1. Flush the session with req.session.flush()
  // 2. Redirect to homepage
  req.session.flush()

  res.writeHead(302, {'Location': '/admin'})
  res.end()
})

router.add('/*', (req, res, url) => {
  res.setHeader('Content-Type', mime.lookup(req.url))
  fs.readFile('.' + req.url, function (err, file) {
    if (err) {
      res.setHeader('Content-Type', 'text/html')
      res.end('404')
    }
    res.end(file)
  })
})

module.exports = router
