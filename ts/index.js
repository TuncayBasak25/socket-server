"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = void 0;
const ws_1 = require("ws");
const parseJson_1 = require("./parseJson");
class Socket {
    static listen(port) {
        const PORT = process.env.PORT || port;
        this.server = new ws_1.WebSocketServer({ port: Number(PORT) });
        this.server.on('listening', () => console.log(`WebSocket server is running on ws://localhost:${PORT}`));
        this.server.on('connection', (webSocket) => new Socket(webSocket));
    }
    static get(id) {
        return this.sockets.get(id);
    }
    static registerMethod(name, method) {
        this.methods[name] = method;
    }
    constructor(webSocket) {
        this.webSocket = webSocket;
        this.data = {};
        this.id = Socket.socketCount++;
        Socket.sockets.set(this.id, this);
        webSocket.on("message", (rawData) => this.handleMessage(rawData.toString()));
        webSocket.on("close", () => Socket.sockets.delete(this.id));
    }
    sendMessage(method, body) {
        this.webSocket.send(JSON.stringify({
            method,
            body
        }));
    }
    sendError(errorBody) {
        this.sendMessage("error", errorBody);
    }
    handleMessage(message) {
        const data = (0, parseJson_1.parseJson)(message);
        if (!data) {
            return this.sendError("Unvalid JSON format!");
        }
        const { method, body } = data;
        if (typeof method != "string") {
            return this.sendError("No method!");
        }
        if (!Socket.methods[method]) {
            return this.sendError(`No method named [${method}]!`);
        }
        Socket.methods[method](this, body);
    }
}
exports.Socket = Socket;
Socket.socketCount = 0;
Socket.sockets = new Map();
Socket.methods = {};
