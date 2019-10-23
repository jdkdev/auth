const { env } = require('./.front/env')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const sqlite3 = require('sqlite3')
let db = new sqlite3.Database(env.get('DB'))

let accessToken = env.get('ACCESS_TOKEN_SECRET')

class User {
    constructor({email, password, date_added, url}) {
        return (async() => {
                let hashedPassword = await bcrypt.hash(password, 10)
                let user = await this.findByEmail(email)
                if (user) {
                    return {message: 'Email taken'}
                }
                return this.create({email, password: hashedPassword, url, date_added})
            })()
        }

    async create({email, password, date_added, url}) {
        var sql = 'INSERT INTO users(email, password, site, date_added) VALUES (?, ?, ?, ?)'
        let id = await this._run(sql, [email, password, url, date_added])
        return this.findByID(id)
    }

    async auth(user, pw) {
        if(await bcrypt.compare(pw, user.password)) {
          return 'Success'
        } else {
          return null
        }
    }

    async findByID(id) {
        var sql = 'SELECT id, email FROM users WHERE id = ?'
        let response = await this._get(sql, [id])
        return response
    }
    async findByEmail(email) {
        var sql = 'SELECT * FROM users WHERE email = ?'
        let response = await this._get(sql, [email])
        return response === undefined ? null : response
    }

    _get(sql, params = []) {
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
    _run(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err, result) {
                if (err) {
                    console.log('Error running sql: ' + sql)
                    reject(err)
                } else {
                    resolve(this.lastID)
                }
            })
        })
    }
}

module.exports = User
