const { env } = require('frontier')

let port = env.get('PORT') || 3131;
let server = require('express')()
let router = require('./router')

server.use('/api/v1', router)
server.listen(port, () => console.log(`Auth Server listening on port ${port}!`))