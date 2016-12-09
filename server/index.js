const path = require('path')
const express = require('express')
const passport = require('passport')
const morgan = require('morgan')
// const LocalStrategy = require('passport-local').Strategy
const cookieParser = require('cookie-parser')
const hbs = require('hbs')
const bodyParser = require('body-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const compression = require('compression')
const flash = require('connect-flash')

const route = require('./newroute')
const dbSchema = require('./schema/db')
const blocks = {}
const app = express()

app.set('env', process.env.NODE_ENV)
app.set('view engine', 'hbs')
app.set('x-powered-by', false)
app.set('views', path.join(__dirname, '..', 'views'))
hbs.registerPartials(path.join(__dirname, '..', 'views', 'partials'))
app.use(express.static('public'))
app.use(flash())

hbs.registerHelper('extend', function (name, context) {
  let block = blocks[name]
  if (!block) block = blocks[name] = []
  block.push(context.fn(this))
})

hbs.registerHelper('block', function (name) {
  const val = (blocks[name] || []).join('\n')
  blocks[name] = []
  return val
})

app.set('trust proxy', true)
app.use(compression())

app.use(morgan('combined'))
app.use(cookieParser(process.env.SESSION_SECRET))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

module.exports = (connection) => {
  const schema = dbSchema(connection)
  const User = schema.User
  app.set('schema', schema)

  passport.use(User.createStrategy())
  passport.serializeUser(User.serializeUser())
  passport.deserializeUser(User.deserializeUser())

  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: connection })
  }))

  app.use(passport.initialize())
  app.use(passport.session())

  route.register(app, passport)

  app.listen(process.env.PORT)
}
