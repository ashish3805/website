const mongo = require('./server/mongo')
const server = require('./server/server')

mongo((connection) => server(connection))
