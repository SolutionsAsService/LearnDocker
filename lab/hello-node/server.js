const http = require('http')
const os = require('os')

const port = process.env.PORT || 3000

http
  .createServer((req, res) => {
    res.setHeader('Content-Type', 'text/plain')
    res.end('Hello from container ' + os.hostname() + '\n')
  })
  .listen(port, () => console.log('listening on ' + port))
