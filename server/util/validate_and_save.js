const Joi = require('joi')

const addressSchema = require('../schema/address')
const mailchimp = require('../mailchimp')

module.exports = (schema, request, cb) => {
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

        cb(mongooseErr)
      })
    } else {
      console.error(err)
      cb(err)
    }
  })
}
