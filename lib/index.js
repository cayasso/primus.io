'use strict';

/**
 * Module dependencies.
 */

var library = require('./middleware/primus')
  , Emitter = require('eventemitter3')
  , Primus = require('primus');

/**
 * Module exports.
 */

module.exports = PrimusIO;

/**
 * PrimusIO constructor.
 *
 * @constructor
 * @param {http.Server} server HTTP or HTTPS server instance.
 * @param {Object} options Configuration
 * @api public
 */

function PrimusIO(server, options) {
  if (!(this instanceof PrimusIO)) return new PrimusIO(server, options);

  Primus.call(this, server, options);

  this
    .use('primus.io.js', library, this.indexOfLayer('primus.js'))
    .plugin('multiplex', 'primus-multiplex')
    .plugin('emitter', 'primus-emitter')
    .plugin('rooms', 'primus-rooms')
    .remove('primus.js');
}

// Inherits from `Primus` class.
PrimusIO.prototype.__proto__ = Primus.prototype;

// Copy over all static methods.
Object.keys(Primus).forEach(function each(ns) {
  var prop = Primus[ns];
  PrimusIO[ns] = 'function' !== typeof prop ? prop : prop.bind(Primus);
});

// Create socket.
PrimusIO.createSocket = function createSocket(options) {
  return (new PrimusIO(new Emitter(), options)).Socket;
};
