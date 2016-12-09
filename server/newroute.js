// const csrf = require('csurf')({ cookie: true })
const AccountUtil = require('./util/account')
const clusters = require('../config/clusters.json')
const protocols = require('../config/protocols.json')
const team = require('../config/team.json')

const renderWithData = (req, res, view, data = {}) => {
  const user = req.user
  const url = `${req.protocol}://${req.hostname}${req.originalUrl}`

  const title = 'Reserve Your Interplanetary Address'
  const description = 'Nebulis is a global distributed directory intended to upgrade and replace the existing Domain Name System using the Ethereum blockchain. A new phonebook for a new web. Nebulis is also compatible with a wide variety of content-addressed protocols like IPFS and MaidSafe.'

  return res.render(view, Object.assign({ user, title, description, url }, data))
}

module.exports.register = (app, passport) => {
  const Account = AccountUtil(app.get('schema'))

  app.get('/team', (req, res) => renderWithData(req, res, 'team', {
    title: 'Team',
    description: 'Nebulis Team',
    team
  }))

  app.get('/docs', (req, res) => renderWithData(req, res, 'docs', {
    title: 'Documentation',
    description: 'Nebulis Documentation'
  }))

  app.get('/', (req, res) => {
    if (req.user && req.user.interplanetaryAddress) return res.redirect('/dashboard')
    else return renderWithData(req, res, 'index', { clusters })
  })

  app.get('/account', (req, res) => {
    const reserve = !!req.query.reserve
    const error = req.flash('error')
    return res.render('login', { reserve, error })
  })

  app.get('/account/logout', (req, res) => {
    req.logout()
    return res.redirect('/')
  })

  app.post('/account/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/error'
  }))

  app.post('/account/register', (req, res) => {
    const { name, email, password } = req.body

    return Account.createUser(name, email, password, (err, user) => {
      if (err) return res.redirect('/error')
      else {
        return Account.authenticateUser(req, user, (err) => {
          if (err) return res.redirect('/error')
          else return res.redirect('/dashboard')
        })
      }
    })
  })

  app.get('/dashboard', Account.validateLogin('/account'), (req, res) => renderWithData(req, res, 'dashboard', {
    address: req.user.interplanetaryAddress.fqdn,
    protocols,
    clusters
  }))

  app.get('/reserve', (req, res) => {
    const { cluster, domain } = req.query
    const address = `${cluster}.${domain}`

    return Account.findIPA(cluster, domain, (err, ipa) => {
      if (err) return res.redirect('/error')
      else {
        return renderWithData(req, res, 'reserve', {
          available: !ipa,
          cluster,
          domain,
          address,
          protocols
        })
      }
    })
  })

  app.post('/reserve', (req, res) => {
    const user = req.user
    const { name, email, password, cluster, domain } = req.body

    if (req.user) {
      return Account.createIPA(user, cluster, domain, (err, ipa) => {
        if (err) return res.redirect('/error')
        else return res.redirect('/dashboard')
      })
    } else {
      return Account.createUserAndIPA(name, email, password, cluster, domain, (err, user, ipa) => {
        if (err) return res.redirect('/error')
        else {
          return Account.authenticateUser(req, user, (err) => {
            if (err) return res.redirect('/error')
            else {
              return res.redirect('/dashboard')
            }
          })
        }
      })
    }
  })
}
