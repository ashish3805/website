// const csrf = require('csurf')({ cookie: true })
const AccountUtil = require('./util/accountutil')
const RouteUtil = require('./util/routeutil')

const clusters = require('../config/clusters.json')
const protocols = require('../config/protocols.json')
const team = require('../config/team.json')

module.exports.register = (app, passport) => {
  const Account = AccountUtil(app.get('schema'))

  app.get('/team', (req, res) => RouteUtil.renderWithData(req, res, 'team', {
    title: 'Team',
    description: 'Nebulis Team',
    team
  }))

  app.get('/docs', (req, res) => RouteUtil.renderWithData(req, res, 'docs', {
    title: 'Documentation',
    description: 'Nebulis Documentation'
  }))

  app.get('/', (req, res) => {
    if (req.user && req.user.interplanetaryAddress) return res.redirect('/dashboard')
    else return RouteUtil.renderWithData(req, res, 'index', { clusters })
  })

  app.get('/account', (req, res) => {
    const reserve = !!req.query.reserve
    const error = req.flash('error')
    console.log(error)
    const title = 'Login'
    return RouteUtil.renderWithData(req, res, 'login', { title, reserve, error })
  })

  app.get('/account/logout', (req, res) => {
    req.logout()
    return res.redirect('/')
  })

  app.get('/dashboard', Account.validateLogin('/account'), (req, res) => RouteUtil.renderWithData(req, res, 'dashboard', {
    address: req.user.interplanetaryAddress.fqdn,
    protocols,
    clusters
  }))

  app.get('/reserve', (req, res) => {
    const { cluster, domain } = req.query
    const address = `${cluster}.${domain}`

    return Account.findIPA(cluster, domain, (err, ipa) => {
      if (err) return RouteUtil.flashAndReturnError(req, res, err)
      else {
        return RouteUtil.renderWithData(req, res, 'reserve', {
          available: !ipa,
          cluster,
          domain,
          address,
          protocols
        })
      }
    })
  })

  app.get('/error', (req, res) => {
    const error = req.flash('error')[0]

    if (!error) return res.redirect('/')

    const title = `Error: ${error}`

    return RouteUtil.renderWithData(req, res, 'error', { title, error })
  })

  app.post('/account/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureFlash: 'Email and/or password is wrong.',
    failureRedirect: '/account'
  }))

  app.post('/account/register', (req, res) => {
    const { name, email, password } = req.body

    return Account.createUser(name, email, password, (err, user) => {
      if (err) return RouteUtil.flashAndReturnError(req, res, err)
      else {
        // send email for new account

        return Account.authenticateUser(req, user, (err) => {
          if (err) return RouteUtil.flashAndReturnError(req, res, err)
          else return res.redirect('/dashboard')
        })
      }
    })
  })

  app.post('/reserve', (req, res) => {
    const user = req.user
    const { name, email, password, cluster, domain } = req.body

    if (req.user) {
      return Account.createIPA(user, cluster, domain, (err, ipa) => {
        if (err) return RouteUtil.flashAndReturnError(req, res, err)
        else {
          // send email for IPA
          return res.redirect('/dashboard')
        }
      })
    } else {
      return Account.createUserAndIPA(name, email, password, cluster, domain, (err, user, ipa) => {
        if (err) return RouteUtil.flashAndReturnError(req, res, err)
        else {
          // send email for new account & IPA

          return Account.authenticateUser(req, user, (err) => {
            if (err) return RouteUtil.flashAndReturnError(req, res, err)
            else {
              return res.redirect('/dashboard')
            }
          })
        }
      })
    }
  })
}
