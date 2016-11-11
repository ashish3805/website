const Joi = require('joi')

const schema = Joi.object().keys({
  name: Joi.string().required().min(2),
  email: Joi.string().email().required(),
  cluster: Joi.string().required().regex(/^(home|wallet|users|music|watch|learn|show|public)$/),
  domain: Joi.string().required().min(5).max(63)
})

module.exports = schema
