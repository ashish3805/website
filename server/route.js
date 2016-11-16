const Joi = require('joi')

const addressSchema = require('./schema/address')
const mailchimp = require('./mailchimp')

const team = require('../team.json')

const wrapMetadata = (request, data) => {
  const url = `${request.connection.info.protocol}://${request.info.host}${request.url.pathname}`
  return Object.assign({ url }, data)
}

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
    method: '*',
    path: '/{params*}',
    vhost: 'nebulis.io',
    handler: (request, reply) => reply.redirect(`http://www.nebulis.io${request.url.path}`)
  },
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      const reserve = request.yar.get('reserve')

      if (reserve) request.yar.clear('reserve')

      const data = {
        title: 'Home',
        reserve: reserve,
        description: 'Nebulis is a global distributed directory intended to upgrade and replace the existing Domain Name System using the Ethereum blockchain. A new phonebook for a new web. Nebulis is also compatible with a wide variety of content-addressed protocols like IPFS and MaidSafe.'
      }

      return reply.view('index', wrapMetadata(request, data))
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
          const data = {
            title: 'Reserved addresses',
            description: 'List of reserved addresses',
            addresses
          }

          return reply.view('list', wrapMetadata(request, data))
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
      const data = {
        title: 'Documentation',
        description: 'Documentation for Nebulis'
      }

      return reply.view('docs', wrapMetadata(request, data))
    }
  },
  {
    method: 'GET',
    path: '/team',
    handler: (request, reply) => {
      const data = {
        title: 'Team',
        description: 'Nebulis Team',
        team
      }

      return reply.view('team', wrapMetadata(request, data))
    }
  }
]
