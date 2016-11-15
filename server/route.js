const Joi = require('joi')

const addressSchema = require('./schema/address')
const mailchimp = require('./mailchimp')

const team = require('../team.json')

const validateAndSave = (schema, request, cb) => {
  Joi.validate(request.payload, addressSchema, (err, value) => {
    if (!err) {
      const address = new schema.InterplanetaryAddress(value)

      address.save((mongooseErr) => {
        if (mongooseErr) {
          console.error(mongooseErr)
        } else if (value.subscribe) {
          mailchimp(value.email, (mailchimpError) => {
            if (mailchimpError) {
              console.error(mailchimpError)
            }
          })
        }

        cb(!mongooseErr)
      })
    } else {
      cb(false)
    }
  })
}

module.exports = (schema) => [
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      const reserve = request.yar.get('reserve')

      request.yar.clear('reserve')

      return reply.view('index', { team, reserve })
    }
  },
  {
    method: 'POST',
    path: '/reserve',
    handler: (request, reply) => {
      validateAndSave(schema, request, (status) => {
        request.yar.set('reserve', { success: status })
        return reply.redirect('/')
      })
    }
  },
  {
    method: 'GET',
    path: '/reserved_addresses',
    handler: (request, reply) => {
      schema.InterplanetaryAddress.find({}, (err, addresses) => {
        if (!err) {
          return reply.view('list', { addresses })
        } else {
          throw err
        }
      })
    }
  },
  {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: 'public'
      }
    }
  },
  {
    method: 'GET',
    path: '/docs',
    handler: (request, reply) => {
      return reply.view('docs')
    }
  }
]
