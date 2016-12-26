module.exports = (schema) => {
  const { User, InterplanetaryAddress } = schema

  return {
    findIPA: function (cluster, domain, cb) {
      return InterplanetaryAddress.findOne({ cluster, domain }, (err, ipa) => {
        if (err) {
          console.error(err)
          return cb(err)
        } else return cb(null, ipa)
      })
    },
    validateLogin: function (redirect) {
      return function (req, res, next) {
        if (req.user) return next()
        else return res.redirect(redirect)
      }
    },
    authenticateUser: function (req, user, cb) {
      return req.login(user, (err) => {
        if (err) {
          console.log(err)
          return cb(err)
        } else return cb(null)
      })
    },
    createUser: function (name, email, password, cb) {
      return User.register(new User({ name, email }), password, (err, user) => {
        if (err) {
          console.error(err)
          return cb(err)
        } else {
          return cb(null, user)
        }
      })
    },
    createIPA: function (user, cluster, domain, cb) {
      return InterplanetaryAddress.create({ user, cluster, domain }, (err, ipa) => {
        if (err) {
          console.error(err)
          return cb(err)
        } else {
          return user.update({ interplanetaryAddress: ipa.id }, (err, raw) => {
            if (err) {
              console.error(err)
              return cb(err)
            } else {
              return cb(null, ipa)
            }
          })
        }
      })
    },
    createUserAndIPA: function (name, email, password, cluster, domain, cb) {
      return this.createUser(name, email, password, (err, user) => {
        if (err) return cb(err)
        else {
          this.createIPA(user, cluster, domain, (err, ipa) => {
            if (err) return cb(err)
            else return cb(null, user, ipa)
          })
        }
      })
    }
  }
}
