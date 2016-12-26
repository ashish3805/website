const Schema = require('mongoose').Schema
const passportLocalMongoose = require('passport-local-mongoose')

const clusters = require('../../config/clusters.json')

const User = Schema({
  isAdmin: Boolean,
  name: String,
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true
  },
  interplanetaryAddress: { type: Schema.Types.ObjectId, ref: 'InterplanetaryAddress' }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
})

User.plugin(passportLocalMongoose, {
  usernameField: 'email',
  passwordField: 'password',
  populateFields: 'interplanetaryAddress',
  errorMessages: {
    TooManyAttemptsError: 'Account is locked due to too many failed login attempts',
    IncorrectPasswordError: 'Email or password are incorrect',
    IncorrectUsernameError: 'Email or password are incorrect',
    MissingUsernameError: 'No email was given',
    UserExistsError: 'A user with the given email is already registered'
  }
})

const InterplanetaryAddress = Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  cluster: {
    type: String,
    enum: clusters
  },
  domain: {
    type: String,
    lowercase: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
})

InterplanetaryAddress.index({ cluster: 1, domain: 1 }, { unique: true })

InterplanetaryAddress.virtual('fqdn').get(function () {
  return `${this.cluster}.${this.domain}`
})

module.exports = (connection) => {
  const schema = {
    User: connection.model('User', User),
    InterplanetaryAddress: connection.model('InterplanetaryAddress', InterplanetaryAddress)
  }

  return schema
}
