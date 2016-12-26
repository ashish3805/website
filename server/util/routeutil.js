const renderWithData = (req, res, view, data = {}) => {
  const user = req.user
  const url = `${req.protocol}://${req.hostname}${req.originalUrl}`

  const title = 'Reserve Your Interplanetary Address'
  const description = 'Nebulis is a global distributed directory intended to upgrade and replace the existing Domain Name System using the Ethereum blockchain. A new phonebook for a new web. Nebulis is also compatible with a wide variety of content-addressed protocols like IPFS and MaidSafe.'

  return res.render(view, Object.assign({ user, title, description, url }, data))
}

const flashAndReturnError = (req, res, err) => {
  console.error(err)
  req.flash('error', err)
  return res.redirect('/error')
}

module.exports = {
  renderWithData,
  flashAndReturnError
}
