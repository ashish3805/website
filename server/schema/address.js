const Joi = require('joi')

const clusters = require('../../config/clusters.json')
const reservedAddresses = require('../../config/reserved_addresses')

const schema = Joi.object().keys({
  name: Joi.string().min(2).required().label('Name'),
  email: Joi.string().email().required().label('Email'),
  cluster: Joi.string().valid(clusters).required().label('Cluster'),
  domain: Joi.string().invalid(reservedAddresses).min(5).max(63).insensitive().required().label('Domain'),
  subscribe: Joi.boolean().default(false)
})

module.exports = schema
