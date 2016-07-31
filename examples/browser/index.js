'use strict';

const http = require('http');
const fs = require('fs');

const PrimusIO = require('../../');

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  fs.createReadStream(__dirname + '/index.html').pipe(res);
});

const primus = new PrimusIO(server);

primus.on('connection', function connection(spark) {
  spark.on('join', (rooms, fn) => spark.join(rooms, fn));

  spark.send('hello', 'world');

  setInterval(() => {
    spark.room('sport').send('sport', 'Brazil Champion!');
  }, 3500);

  setInterval(() => {
    spark.room('news').send('news', 'Breaking news!');
  }, 5000);
});

server.listen(() => console.log('listening on *:%d', server.address().port));
