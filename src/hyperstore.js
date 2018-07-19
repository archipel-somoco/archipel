var hypergraph = require('hyper-graph-db')
var thunky = require('thunky')
var events = require('events')
var inherits = require('inherits')

// var multi = require('multihyperdb')
// var opts = {
//   path: './db',
//   dbOpts: {valueEncoding: 'json'}
// }
// var Multi = multi(opts)

var dbPath = '/home/gaunab/hyper-readings/testlist1.db'

function Hyperstore (opts) {
  if (!(this instanceof Hyperstore)) return new Hyperstore(opts)
  events.EventEmitter.call(this)
  this.dbs = {}
  this.ready = thunky(this._ready.bind(this))
  this.ready()
}

inherits(Hyperstore, events.EventEmitter)

Hyperstore.prototype._ready = function (cb) {
  var self = this
  var graph = hypergraph(dbPath, {valueEncoding: 'uft-8'})
  graph.db.ready(() => {
    var key = graph.db.key.toString('hex')
    self.dbs[key] = {graph: graph, key: key, title: 'A first archive'}
    self.emit('ready')
    cb(null)
  })
}

Hyperstore.prototype.query = function (key, q) {
  if (!key) key = Object.keys(this.dbs)[0]
  return this.dbs[key].graph.getStream(q)
}

Hyperstore.prototype.archives = function (cb) {
  var self = this
  this.ready(() => {
    var archives = Object.keys(self.dbs).reduce((ret, key) => {
      ret.push({ key: key, title: self.dbs[key].title })
      return ret
    }, [])
    console.log('load archives', archives)
    if (cb) cb(null, archives)
  })
}

module.exports = Hyperstore
