const mongoose = require('mongoose')

module.exports = (cb) => {
  const conn = mongoose.createConnection(process.env.MONGO_URL)

  conn.once('error', () => {
    throw new Error('Error connecting mongoDB')
  })

  conn.once('open', () => {
    console.log('Connected to mongoDB')
    cb(conn)
  })
}
