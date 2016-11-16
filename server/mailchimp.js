const request = require('request')

const { MAILCHIMP_LIST_ID, MAILCHIMP_API_KEY } = process.env

const options = {
  method: 'POST',
  url: `https://us14.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`,
  auth: {
    user: 'nebulis-nodejs',
    pass: MAILCHIMP_API_KEY
  },
  json: true
}

module.exports = (email, cb) => {
  request(Object.assign(options, {
    body: {
      email_address: email,
      status: 'pending'
    }
  }), function (error, response, body) {
    if (error) {
      console.error(error)
    }

    cb(error)
  })
}
