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
    constructor(webSocket) {
        this.webSocket = webSocket;
        this.data = new Map();
        this.id = Socket.socketCount++;
        Socket.sockets.set(this.id, this);
        webSocket.on("message", (rawData) => this.handleMessage(rawData.toString()));
        webSocket.on("close", () => Socket.sockets.delete(this.id));
    }
    send(method, body) {
        const data = {};
        data[method] = body;
        this.webSocket.send(JSON.stringify(data));
    }
    sendAction(action, body = {}) {
        this.send("action", { action, body });
    }
    sendSet(key, value) {
        const set = {};
        set[key] = value;
        this.send("set", set);
    }
    sendGet(key) {
        this.send("get", key);
    }
    sendError(errorBody = {}) {
        this.send("error", { error: errorBody });
    }
    handleMessage(message) {
        const data = (0, parseJson_1.parseJson)(message);
        if (!data) {
            return this.sendError("Unvalid JSON format!");
        }
        const { action, get, set } = data;
        if (action) {
            if (typeof action.action != "string") {
                return this.sendError(`No action!`);
            }
            if (!Socket.actions[action.action]) {
                return this.sendError(`No action named [${action.action}]`);
            }
            return Socket.actions[action.action](this, action.body);
        }
        if (get) {
            if (typeof get == "string" || typeof get == "number") {
                const value = this.data.get(get);
                if (value) {
                    this.sendSet(get, value);
                }
            }
        }
        if (set) {
            if (typeof set.key == "string" || typeof set.key == "number") {
                this.data.set(set.key, set.value);
            }
        }
    }
}
exports.Socket = Socket;
Socket.socketCount = 0;
Socket.sockets = new Map();
Socket.actions = {};
