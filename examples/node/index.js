'use strict';

const http = require('http');

const PrimusIO = require('../../');

const server = http.createServer();
const primus = new PrimusIO(server);

primus.on('connection', (spark) => {
  spark.send('ok', 'connected', (msg) => console.log(msg));
  spark.on('join', (room, fn) => spark.join(room, fn));

  setInterval(() => spark.room('news').send('brazil', 'CHAMPION'), 2000);
});

const client = (id) => {
  const socket = new primus.Socket(`http://localhost:${server.address().port}`);

  socket.on('brazil', (msg) => console.log('Brazil is', msg, id));
  socket.on('ok', (msg, fn) => {
    console.log(id, 'is', msg);
    fn(`${id} got message`);
  });

  socket.send('join', 'news', () => console.log(id, 'joined room news'));
};

server.listen(() => {
  console.log('listening on *:%d', server.address().port);

  client('client1');
  client('client2');
});
