const { env } = require('./.front/env')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const sqlite3 = require('sqlite3')
let db = new sqlite3.Database(env.get('DB'))

let accessToken = env.get('ACCESS_TOKEN_SECRET')

function generateAccessToken(user) {
  return jwt.sign({id: user.id, email: user.email}, accessToken, { expiresIn: '10m' })
}

// Middleware
function authenticateTokenMiddleware(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, accessToken, (err, user) => {
    if (err) return res.sendStatus(403)

    req.user = user
    console.log({ user })
    next()
  })
}


async function authUser(user, pw) {
  try {
    if(await bcrypt.compare(pw, user.password)) {
      return 'Success'
    } else {
      return 'Not Allowed'
    }
  } catch (e) {
        return ''
  }
}

/*
async function addUser({email, password}) {
    try {
        db.serialize(function() {
          var stmt = db.prepare("INSERT INTO users(email, password) VALUES (?, ?)")
          stmt.run(email, password)
        })
    } catch {
        return new Error
    }
}
*/

async function findUser(email) {
    var sql = 'SELECT * FROM users WHERE email = ?'
    let response = await _get(sql, [email])
    return response
}

async function getUsers(email) {
    var sql = 'SELECT id, email FROM users'
    let response = await _get(sql)
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

module.exports = {
    generateAccessToken,
    authenticateTokenMiddleware,
    findUser,
    authUser,
}
