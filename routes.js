//register, login, logout, refreshtokens, verify
const { env } = require('./.front/env')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')

let { authenticateTokenMiddleware, findUser, authUser, generateAccessToken } = require('./functions')
let User = require('./User')
let express = require('express')
let router = express.Router()
let refreshToken = env.get('REFRESH_TOKEN_SECRET')

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

//TODO:move to DB
let refreshTokens = []

router.post('/register', async (req, res) => {
    console.log(req.body, req.url)
    try {
        //TODO: change date.now to something else
        let user = { email: req.body.email, password: req.body.password, date_added: Date.now(), url: req.body.url }
        let newUser = await new User(user)
        res.status(201).send(newUser)
    } catch (e) {
       console.log('error', e)
        res.status(500).send()
    }
})

router.post('/login', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let user = await User.findByEmail(email)

    try {
        if (await User.auth(user, password)) {
            let accessToken = generateAccessToken(user)
            const refreshToken = jwt.sign(user, refreshToken)

            refreshTokens.push(refreshToken)
            res.json({ accessToken: accessToken, refreshToken: refreshToken })
        } else {
            return res.json({message: 'Not allowed'})
        }
    } catch (e) {
        console.log(e)
        return res.json({message: 'You are not registered!'})
    }
})

router.post('/refresh', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)

    jwt.verify(refreshToken, refreshToken, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken: accessToken })
    })
})

router.get('/verify', authenticateTokenMiddleware, async (req, res) => {
    res.json({message: 'Valid Token'})
})

router.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.sendStatus(204)
})

module.exports = router