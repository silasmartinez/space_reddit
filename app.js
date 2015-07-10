var http = require('http'),
  router = require('./router'),
  url = require('url'),
  mime = require('mime'),
  NodeSession = require('node-session'),
  session = new NodeSession({secret: 'DLISUBliubv31qece131f'})

var server = http.createServer(function (req, res) {
  session.startSession(req, res, function () {
    router.handle(req, res)
  })

})

server.listen(8000, function (err) {
  if (err) console.log('Doah', err)
  console.log('Woot. A server is running on port 8000')
})
