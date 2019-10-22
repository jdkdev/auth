//register, login, logout, refreshtokens, verify
const { env } = require('./.front/env')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')

let { authenticateToken, findUser, authUser, generateAccessToken } = require('./functions')
let express = require('express')
let router = express.Router()

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

//TODO:move to DB
let refreshTokens = []

router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = { email: req.body.email, password: hashedPassword }
        addUser(user)
        res.status(201).send()
    } catch (e) {
       console.log('error', e)
        res.status(500).send()
    }
})

router.post('/login', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let user = await findUser(email)

    try {
        if (await authUser(user, password)) {
            let accessToken = generateAccessToken(user)
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)

            refreshTokens.push(refreshToken)
            res.json({ accessToken: accessToken, refreshToken: refreshToken })
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

    jwt.verify(refreshToken, env.get('REFRESH_TOKEN_SECRET'), (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken: accessToken })
    })
})

router.get('/verify', authenticateToken, async (req, res) => {
    res.json({message: 'Valid Token'})
})

router.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.sendStatus(204)
})

module.exports = router
