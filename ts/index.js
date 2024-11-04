"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = void 0;
const ws_1 = require("ws");
class Socket {
    static start(port = 8080) {
        const PORT = process.env.PORT || port;
        const server = new ws_1.WebSocketServer({ port: Number(PORT) });
        server.on('listening', () => {
            console.log(`WebSocket server is running on ws://localhost:${PORT}`);
        });
        server.on('connection', (socket) => {
            this.create(socket);
        });
        return server;
    }
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
        socket.on("message", (rawdata) => {
            try {
                const data = JSON.parse(rawdata.toString());
                this.handle(data);
            }
            catch (error) {
                this.sendMessage("error", "Unvalid JSON format!");
            }
        });
        socket.on("close", () => {
            this.onClose();
            Socket.delete(this.id);
        });
        this.initMethods();
    }
    registerMethod(name, func, validate) {
        this.methods[name] = (data) => {
            if (validate && !validate(data)) {
                return this.sendMessage("error", `Unvalid data format for method [${name}]!`);
            }
            func.call(this, data);
        };
    }
    initMethods() {
        //To reigister methods at instanciation
    }
    onClose() {
        //For derived class
    }
    handle(data) {
        const methodName = data.method;
        if (typeof methodName != "string") {
            return this.sendMessage("error", "You have to specify a 'method' attribute implemented by the server!");
        }
        if (!this.methods[methodName]) {
            return this.sendMessage("error", `No implementation for 'method' ${methodName}!`);
        }
        this.methods[methodName](data);
    }
    sendMessage(key, value) {
        const obj = {};
        obj[key] = value;
        this.socket.send(JSON.stringify(obj));
    }
}
exports.Socket = Socket;
Socket.instances = new Map();
Socket.count = 0;
