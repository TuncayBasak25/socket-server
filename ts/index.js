"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const PORT = process.env.PORT || 8080;
const server = new ws_1.WebSocketServer({ port: Number(PORT) });
server.on('listening', () => {
    console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});
server.on('connection', (socket) => {
    Socket.create(socket);
});
class Socket {
    static create(socket) {
        this.instances.set(this.count, new this(socket));
        this.count++;
    }
    static delete(id) {
        this.instances.delete(id);
    }
    static get(id) {
        return this.instances.get(id);
    }
    constructor(socket) {
        this.methods = {};
        this.socket = socket;
        this.id = Socket.count;
        socket.on("open", () => {
            this.onOpen();
        });
        socket.on("message", (data) => {
            this.handle(JSON.parse(data.toString()));
        });
        socket.on("close", () => {
            this.onClose();
            Socket.delete(this.id);
        });
    }
    setMethod(name, func) {
        this.methods[name] = func;
    }
    onOpen() {
        //for derived class
    }
    onClose() {
        //For derived class
    }
    handle(data) {
        if (typeof data.method != "string") {
            return this.sendMessage("error", "You have to specify a 'method' attribute implemented by the server!");
        }
        if (!this.methods[data.method]) {
            return this.sendMessage("error", `No implementation for 'method' ${data.method}!`);
        }
        this.methods[data.action](data);
    }
    sendMessage(key, value) {
        const obj = {};
        obj[key] = value;
        this.socket.send(JSON.stringify(obj));
    }
}
Socket.instances = new Map();
Socket.count = 0;
