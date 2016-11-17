const validateAndSave = require('./util/validate_and_save')
const team = require('../config/team.json')
const clusters = require('../config/clusters.json')

const wrapMetadata = (request, data) => {
  const url = `${request.connection.info.protocol}://${request.info.host}${request.url.pathname}`
  return Object.assign({ url }, data)
}

module.exports = (schema) => [
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      const reserve = request.yar.get('reserve')

      if (reserve) request.yar.clear('reserve')

      const data = {
        title: 'Reserve Your Interplanetary Address',
        reserve: reserve,
        description: 'Nebulis is a global distributed directory intended to upgrade and replace the existing Domain Name System using the Ethereum blockchain. A new phonebook for a new web. Nebulis is also compatible with a wide variety of content-addressed protocols like IPFS and MaidSafe.',
        clusters
      }

      return reply.view('index', wrapMetadata(request, data))
    }
  },
  {
    method: 'POST',
    path: '/reserve',
    handler: (request, reply) => {
      validateAndSave(schema, request, (error) => {
        if (error) {
          if (error.isJoi) {
            request.yar.set('reserve', { success: false, messages: error.details })
          } else if (error.code === 11000) {
            request.yar.set('reserve', { success: false, messages: [ { message: 'Email and/or Interplanetary Address is already registered' } ] })
          } else {
            request.yar.set('reserve', { success: false })
          }
        } else {
          request.yar.set('reserve', { success: true })
        }

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
