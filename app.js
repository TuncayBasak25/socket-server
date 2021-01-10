const http = require('http');
const ws = require('ws');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');

/**
 * Create HTTP server.
 */

const server = http.createServer(() => console.log('test'));

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}


/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
}

/**
 * Web socket implementation.
 */

const connections = {};
const wsServer = new ws.Server( { noServer: true } );

const methods = {
  open: require('./methods/open'),
  message: require('./methods/message'),
  key: require('./methods/key')
};

const webSocket = server => {
  wsServer.on('connection', socket => {
    socket.connections = connections;

    //Overwrite send function to automatically json stringify
    socket.oldSend = socket.send;
    socket.send = data => socket.oldSend(JSON.stringify(data));

    socket.on('message', body => {
      const data = JSON.parse(body);
      const { method } = data;

      if (!method) socket.send({ error: 'Method is missing' });
      else if (!methods[method]) socket.send({ error: 'This method does not exists.' });
      else methods[method](socket, data);
    });
  });

  server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
      wsServer.emit('connection', socket, request);
    });
  });
}

const test = webSocket(server);
