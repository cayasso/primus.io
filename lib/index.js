'use strict';

/**
 * Module dependencies.
 */

var Primus = require('primus')
  , Emitter = require('eventemitter3');

/**
 * Module exports.
 */

module.exports = PrimusIO;

/**
 * PrimusIO constructor.
 *
 * @constructor
 * @param {HTTP.Server} server HTTP or HTTPS server instance.
 * @param {Object} options Configuration
 * @api public
 */

function PrimusIO(server, options) {
  if (!(this instanceof PrimusIO)) return new PrimusIO(server, options);

  Primus.call(this, server, options);
  
  this

  // Use our plugins.
  .use('multiplex', 'primus-multiplex')
  .use('emitter', 'primus-emitter')
  .use('rooms', 'primus-rooms')

  // Serve our own primus file via middleware.
  .remove('primus.js')
  .before('primus.io.js', require('./middleware/primus'));
}

// Inherits from `Primus` class.
PrimusIO.prototype.__proto__ = Primus.prototype;

// Copy over all static methods.
Object.keys(Primus).forEach(function each(ns) {
  var prop = Primus[ns];
  PrimusIO[ns] = 'function' !== prop ? prop : prop.bind(Primus);
});

// create web socket.
PrimusIO.createSocket = function createSocket(options) {
  return (new PrimusIO(new Emitter(), options)).Socket;
};
