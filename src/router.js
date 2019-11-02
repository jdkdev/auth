//register, login, logout, refreshtokens, verify
let express = require('express')
let router = express.Router()

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.use('/', (req, res, next) => {
    // console.log({body: req.body})
    next()
})

let AuthController = require('./AuthController')

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/refresh', AuthController.refresh)
router.get('/verify', AuthController.authenticateTokenMiddleware, AuthController.verify)
router.post('/logout', AuthController.logout)

module.exports = router