const { env } = require('./.front/env')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const sqlite3 = require('sqlite3')
let db = new sqlite3.Database(env.get('DB'))

function generateAccessToken(user) {
  return jwt.sign({id: user.id, email: user.email}, env.get('ACCESS_TOKEN_SECRET'), { expiresIn: '10m' })
}

function addUser({email, password}) {
    db.serialize(function() {
      var stmt = db.prepare("INSERT INTO users(email, password) VALUES (?, ?)")
      stmt.run(email, password)
    })
}

async function authUser(user, pw) {
  try {
    if(await bcrypt.compare(pw, user.password)) {
      return 'Success'
    } else {
      return 'Not Allowed'
    }
  } catch {
        return new Error
  }
}

async function findUser(email) {
    var sql = 'SELECT * FROM users WHERE email = ?'
    let response = await _get(sql, [email])
    return response
}

async function getUsers(email) {
    var sql = 'SELECT id, email FROM users'
    let response = await _all(sql)
    return response
}

function _get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) {
                console.log('Error running sql: ' + sql)
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}
function _all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) {
                console.log('Error running sql: ' + sql)
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, env.get('ACCESS_TOKEN_SECRET'), (err, user) => {
    if (err) return res.sendStatus(403)

    req.user = user
    console.log({ user })
    next()
  })
}

module.exports = {
    generateAccessToken,
    authenticateToken,
    findUser,
    authUser,
}
