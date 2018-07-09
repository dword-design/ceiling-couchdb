const PouchDB = require('pouchdb')
const notnull = require('not-null')

PouchDB.plugin(require('pouchdb-erase'))

module.exports = {

  sync(fromEndpoint, toEndpoint) {

    function _url(endpoint) {
      if (endpoint.inMemory) {
        return endpoint.database
      }
      var result = `http://${notnull(endpoint.user, 'root')}:${notnull(endpoint.password, 'root')}@${notnull(endpoint.host, 'localhost')}`
      if (notnull(endpoint.port, 5984) != 80) {
        result += `:${notnull(endpoint.port,  5984)}`;
      }
      result += `/${notnull(endpoint.database, 'project')}`
      return result
    }

    const fromUrl = _url(fromEndpoint)
    const toUrl = _url(toEndpoint)
    console.log('Connecting to the databases ...')
    const fromDb = new PouchDB(fromUrl)
    const toDb = new PouchDB(toUrl)
    console.log('Cleaning databases ...')
    return toDb.erase()
      .then(() => console.log(`Importing collections from ${fromUrl} ...`))
      .then(() => new Promise(resolve => fromDb.replicate.to(toDb).on('complete', resolve)))
  },

  endpointToString(endpoint = {}) {
    if (endpoint.inMemory) {
      return endpoint.database
    }
    var result = `http://${notnull(endpoint.host, 'localhost') }`
    if (notnull(endpoint.port, 5984) != 80) {
      result += `:${notnull(endpoint.port, 5984)}`
    }
    result += `/${notnull(endpoint.database, 'project')}`
    return result
  }
}
