"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketServer = void 0;
const ws_1 = require("ws");
const socket_1 = require("./socket");
var SocketServer;
(function (SocketServer) {
    let socketCount = 0;
    SocketServer.sockets = new Map();
    SocketServer.methods = {};
    function start(port) {
        const PORT = Number(process.env.PORT || port);
        const server = new ws_1.WebSocketServer({ port: PORT });
        server.on('listening', () => console.log(`WebSocket server is running on ws://localhost:${PORT}`));
        server.on('connection', (webSocket) => {
            const socket = socket_1.Socket.create(socketCount, webSocket, SocketServer.methods);
            SocketServer.sockets.set(socketCount, socket);
            socketCount++;
            webSocket.on("close", () => SocketServer.sockets.delete(socket.id));
        });
    }
    SocketServer.start = start;
    function getSocket(id) {
        return SocketServer.sockets.get(id);
    }
    SocketServer.getSocket = getSocket;
    function getSocketList(idList) {
        const socketList = [];
        for (const id of idList) {
            const socket = SocketServer.sockets.get(id);
            if (socket) {
                socketList.push(socket);
            }
        }
        return socketList;
    }
    SocketServer.getSocketList = getSocketList;
    function getSocketsByQuery(query) {
        const socketList = [];
        for (const socket of SocketServer.sockets.values()) {
            if (query(socket)) {
                socketList.push(socket);
            }
        }
        return socketList;
    }
    SocketServer.getSocketsByQuery = getSocketsByQuery;
})(SocketServer || (exports.SocketServer = SocketServer = {}));
