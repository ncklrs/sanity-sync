// This plugin is only compatible with Sanity v3 and v4
const { incompatible } = require('@sanity/incompatible-plugin')
module.exports = incompatible({
  name: 'sanity-plugin-content-sync',
  versions: '>=3',
})
