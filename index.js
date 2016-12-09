const mongo = require('./server/mongo')
const server = require('./server/index')

mongo((connection) => server(connection))
