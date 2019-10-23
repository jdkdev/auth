const { env } = require('./.front/env')

let port = env.get('PORT') || 3131;
let server = require('express')()
let routes = require('./routes')

server.use('/api/v1', routes)
server.listen(port, () => console.log(`Auth Server listening on port ${port}!`))