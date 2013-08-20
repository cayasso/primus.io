/**
 * Module dependencies.
 */

var Primus = require('primus')
  , Rooms = require('primus-rooms')
  , Emitter = require('primus-emitter')
  , Multiplex = require('primus-multiplex');

/**
 * `Primus#Transformer` reference.
 */

var Transformer = Primus.Transformer;

/**
 * `Transformer#initialise` reference.
 */

var tinit = Transformer.prototype.initialise;

/**
 * Add our own static file path by 
 * overwriting this.primusjs in transformer.
 *
 * @api private
 */

Transformer.prototype.initialise = function () {
  tinit.apply(this, arguments);
  var pathname = this.primus.pathname.split('/').filter(Boolean);
  pathname.push('primus.io.js');
  this.primusjs = '/'+ pathname.join('/');
};

/**
 * `Primus#initialise` reference.
 */

var init = Primus.prototype.initialise;

/**
 * Initialise the real-time transport that was chosen.
 *
 * @param {Mixed} Transformer The name of the transformer or a constructor;
 * @param {Object} options Options.
 * @api private
 */

Primus.prototype.initialise = function () {
  this
  .use('multiplex', Multiplex)
  .use('emitter', Emitter)
  .use('rooms', Rooms);
  return init.apply(this, arguments);
};

/**
 * Module exports.
 */

module.exports = Primus;