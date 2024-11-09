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
    static getList(idList) {
        const socketList = [];
        for (const id of idList) {
            const socket = this.get(id);
            if (socket)
                socketList.push(socket);
        }
        return socketList;
    }
    static registerMethod(name, method) {
        this.methods[name] = method;
    }
    constructor(webSocket) {
        this.webSocket = webSocket;
        this.data = new Map();
        this.id = Socket.socketCount++;
        Socket.sockets.set(this.id, this);
        webSocket.on("message", (rawData) => this.handleMessage(rawData.toString()));
        webSocket.on("close", () => Socket.sockets.delete(this.id));
    }
    set(key, value) {
        this.data.set(key, value);
    }
    get(key) {
        return this.data.get(key);
    }
    delete(key) {
        this.data.delete(key);
    }
    send(method, body) {
        this.webSocket.send(JSON.stringify({
            method,
            body
        }));
    }
    query(key) {
        this.send("query", key);
    }
    error(errorBody) {
        this.send("error", errorBody);
    }
    handleMessage(message) {
        const data = (0, parseJson_1.parseJson)(message);
        if (!data) {
            return this.error("Unvalid JSON format!");
        }
        const { method, body, set, get } = data;
        method && Socket.methods[method](this, body);
        if (typeof set == "object") {
            if (typeof set.key != "string") {
                return this.error("Unvalid set!");
            }
            this.set(set.key, set.value);
        }
        if (typeof get == "string") {
            this.send("get", this.get(get));
        }
    }
}
exports.Socket = Socket;
Socket.socketCount = 0;
Socket.sockets = new Map();
Socket.methods = {};
