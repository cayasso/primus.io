// We need to use this to export our module and to make
// it compatible with browser, I know, I know... this is only 
// for now, I will find a better way.

(function (name, context, definition) {
    if ('undefined' !== typeof module && module.exports) {
      module.exports = definition();
    } else if ('function' === typeof define && define.amd) {
      define(definition);
    } else {
      context[name] = definition();
    }
})("Primus", this, function PRIMUSIO() {

  function PrimusIO(Spark) {

    //var debug = require('debug')('Spark.io:client');

    /**
     * Event types.
     *
     * @api public
     */

    var types = {
      EVENT:  0,
      ACK:    1
    };

    /**
     * Blacklisted events.
     *
     * @api public
     */

    var events = [
      'end',
      'open',
      'data',
      'error',
      'reconnect',
      'connection',
      'disconnection',
      'incoming::',
      'incoming::error',
      'incoming::end',
      'incoming::open',
      'incoming::data',
      'incoming::reconnect',
      'outgoing::end',
      'outgoing::open',
      'outgoing::data',
      'outgoing::error',
      'outgoing::reconnect'
    ];

    /**
     * `Primus#emit` reference.
     */

    var emit = Spark.prototype.emit;

    /**
     * `Primus#initialise` reference.
     */

    var initialise = Spark.prototype.initialise;

    /**
     * Initialise the Primus and setup all
     * parsers and internal listeners.
     *
     * @api private
     */

    Spark.prototype.initialise = function () {
      this.acks = {};
      this.ids = 1;
      initialise.apply(this, arguments);
      this.on('data', this.ondata.bind(this));
      return this;
    };

    /**
     * Called with incoming transport data.
     *
     * @api private
     */

    Spark.prototype.ondata = function (packet) {
      switch (packet.type) {
        case types.EVENT:
          this.onevent(packet);
          break;

        case types.ACK:
          this.onack(packet);
          break;
      }
    };

    /**
     * Emits to this Spark.
     *
     * @return {Socket} self
     * @api public
     */

    Spark.prototype.emit = function (ev) {

      if (~events.indexOf(ev)) {
        emit.apply(this, arguments);
      } else {
        var args = Array.prototype.slice.call(arguments);
        var packet = { type: types.EVENT, data: args };

        // access last argument to see if it's an ACK callback
        if ('function' == typeof args[args.length - 1]) {
          /*if (this._rooms || (this.flags && this.flags.broadcast)) {
            throw new Error('Callbacks are not supported when broadcasting');
          }*/
          var id = this.ids++;
          //debug('emitting packet with ack id %d', id);
          this.acks[id] = args.pop();
          packet.id = id;
        }

        this.write(packet);
      }

      return this;
    };

    /**
     * Called upon event packet.
     *
     * @param {Object} packet object
     * @api private
     */

    Spark.prototype.onevent = function (packet) {
      var args = packet.data || [];
      //debug('emitting event %j', args);

      if (null != packet.id) {
        //debug('attaching ack callback to event');
        args.push(this.ack(packet.id));
      }

      emit.apply(this, args);
    };

    /**
     * Produces an ack callback to emit with an event.
     *
     * @param {Number} packet id
     * @api private
     */

    Spark.prototype.ack = function (id) {
      var self = this;
      var sent = false;
      return function(){
        // prevent double callbacks
        if (sent) return;
        var args = Array.prototype.slice.call(arguments);
        //debug('sending ack %j', args);
        self.write({
          id: id,
          type: types.ACK,
          data: args
        });
      };
    };

    /**
     * Called upon ack packet.
     *
     * @api private
     */

    Spark.prototype.onack = function (packet) {
      var ack = this.acks[packet.id];
      if ('function' == typeof ack) {
        //debug('calling ack %s with %j', packet.id, packet.data);
        ack.apply(this, packet.data);
        delete this.acks[packet.id];
      } else {
        //debug('bad ack %s', packet.id);
      }
    };

    return Spark;
  }

  return this.Primus ? PrimusIO(Primus) : PrimusIO;

});

// [*] End of lib/primus.js
