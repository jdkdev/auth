const { env } = require('./.front/env')

const bodyParser = require('body-parser')

let port = env.get('PORT') || 3131;
let server = require('express')()
let routes = require('./routes')

server.use('/api/v1', routes)
server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())
server.listen(port, () => console.log(`Auth Server listening on port ${port}!`))
