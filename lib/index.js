/**
 * Module dependencies.
 */

var fs = require('fs')
  , http = require('http')
  , Primus = require('primus')
  , PrimusIO = require('./primus')
  , PrimusRooms = require('primus-rooms')
  , debug = require('debug')('primus.io:server')
  , Emitter = require('events').EventEmitter
  , Spark = PrimusIO(Primus.Spark);

// Add rooms to Primus
Primus = PrimusRooms(Primus);

/**
 * `Primus#library` reference.
 */

var library = Primus.prototype.library;

/**
 * Module exports.
 */

module.exports = Server;

/**
 * Server constructor.
 *
 * @param {http.Server|Number|Object} http server, port or options
 * @param {Object} options
 * @api public
 */

function Server (srv, opts) {
  if (!(this instanceof Server)) return new Server(srv, opts);
  if ('object' == typeof srv && !srv.listen) {
    opts = srv;
    srv = null;
  }
  opts = opts || {};
  if (srv) this.attach(srv, opts);
}

/**
 * Inherits from `EventEmitter`.
 */

Server.prototype.__proto__ = Emitter.prototype;

/**
 * Attaches primus.io to a server or port.
 *
 * @param {http.Server|Number} server or port
 * @param {Object} options passed to engine.io
 * @return {Server} self
 * @api public
 */

Server.prototype.attach = function (srv, opts) {

  if ('number' == typeof srv) {
    debug('creating http server and binding to %d', srv);
    var port = srv;
    srv = http.Server(function(req, res){
      res.writeHead(404);
      res.end();
    });

    srv.listen(port);
  }

  opts = opts || {};
  debug('creating Primus instance with opts %j', opts);

  // bind to primus events
  var primus = new Primus(srv, opts);
  this.bind(primus);

  return this;
};

/**
 * Binds primus.io to a Primus instance.
 *
 * @param {Primus} primus
 * @return {Server} self
 * @api public
 */

Server.prototype.bind = function (primus) {
  this.primus = primus;
  this.Socket = primus.Socket;
  this.primus.on('connection', this.onconnection.bind(this));
  return this;
};

/**
 * Called upon a new connection.
 *
 * @param {Spark} spark
 * @return {Server} self
 * @api public
 */

Server.prototype.onconnection = function (conn) {
  debug('incoming connection with id %s', conn.id);
  this.emit('connection', conn);
  return this;
};

/**
 * Called upon a new connection.
 *
 * @param {Spark} spark
 * @return {Server} self
 * @api public
 */

Server.prototype.library = function () {
  return library.apply(this, arguments);
};

/**
 * Save the library to disk.
 *
 * @param {String} dir The location that we need to save the library.
 * @param {function} fn Optional callback, if you want an async save.
 * @api public
 */

Server.prototype.save = function save(path, fn) {
  if (!fn) fs.writeFileSync(path, this.library(), 'utf-8');
  else fs.writeFile(path, this.library(), 'utf-8', fn);
  return this;
};

/**
 * Read a file in a sync way.
 *
 * @param {String} location
 * @api private
 */

function readFile(file) {
  return fs.readFileSync(__dirname + '/' + file, 'utf-8');
}

/**
 * Read a file in a sync way.
 *
 * @param {String} location
 * @api private
 */

Primus.prototype.library = function () {
  var client = library.apply(this, arguments);
  return client += readFile('primus.js');
};

/**
 * Expose listen method.
 */

Server.listen = Server;
