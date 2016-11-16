const Schema = require('mongoose').Schema

const InterplanetaryAddress = Schema({
  name: String,
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true
  },
  cluster: {
    type: String,
    enum: [ 'home', 'wallet', 'users', 'music', 'watch', 'learn', 'shop', 'public' ]
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

InterplanetaryAddress.virtual('interplanetary_address').get(function () {
  return `ipfs://${this.fqdn}`
})

module.exports = (connection) => {
  const schema = {
    InterplanetaryAddress: connection.model('InterplanetaryAddress', InterplanetaryAddress)
  }

  return schema
}
