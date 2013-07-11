var PrimusIO = require('../');
var http = require('http').Server;
var expect = require('expect.js');
var opts = { transformer: 'sockjs', parser: 'JSON' };
