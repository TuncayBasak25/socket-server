"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = void 0;
var Socket;
(function (Socket) {
    function create(id, webSocket, methods) {
        const data = new Map();
        const socket = {
            id,
            do: (method) => webSocket.send(JSON.stringify({ method })),
            set: (key, value) => {
                data.set(key, value);
                webSocket.send(JSON.stringify({ set: { key, value } }));
            },
            get: (key) => data.get(key)
        };
        webSocket.on("message", rawdata => {
            const { method, set } = JSON.parse(rawdata.toString());
            set && data.set(set.key, set.value);
            method && methods[method](socket);
        });
        return socket;
    }
    Socket.create = create;
})(Socket || (exports.Socket = Socket = {}));
