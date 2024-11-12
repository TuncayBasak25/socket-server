"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketServer = void 0;
const ws_1 = require("ws");
const socket_1 = require("./socket");
var SocketServer;
(function (SocketServer) {
    let socketCount = 0;
    const sockets = new Map();
    SocketServer.methods = {};
    function start(port) {
        const PORT = Number(process.env.PORT || port);
        const server = new ws_1.WebSocketServer({ port: PORT });
        server.on('listening', () => console.log(`WebSocket server is running on ws://localhost:${PORT}`));
        server.on('connection', (webSocket) => socket_1.Socket.create(socketCount++, webSocket, SocketServer.methods));
    }
    SocketServer.start = start;
})(SocketServer || (exports.SocketServer = SocketServer = {}));
