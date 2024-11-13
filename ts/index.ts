import { WebSocketServer } from "ws";
import { Socket } from "./socket";

export namespace SocketServer {
    let socketCount = 0;
    export const sockets = new Map<number, Socket>();
    export const methods: { [key: string]: (socket: Socket) => void } = {};

    export function start(port: string | number) {
        const PORT = Number(process.env.PORT || port);
        const server = new WebSocketServer({ port: PORT });

        server.on('listening', () => console.log(`WebSocket server is running on ws://localhost:${PORT}`));

        server.on('connection', (webSocket) => {
            const socket = Socket.create(socketCount, webSocket, methods);
            sockets.set(socketCount, socket);
            socketCount++;

            webSocket.on("close", () => sockets.delete(socket.id));
        });
    }

    export function getSocket(id: number) {
        return sockets.get(id);
    }

    export function getSocketList(idList: number[]) {
        const socketList = [];
        for (const id of idList) {
            const socket = sockets.get(id);
            if (socket) {
                socketList.push(socket);
            }
        }
        return socketList;
    }

    export function getSocketsByQuery(query: (socket: Socket) => boolean) {
        const socketList = [];
        for (const socket of sockets.values()) {
            if (query(socket)) {
                socketList.push(socket);
            }
        }
        return socketList;
    }
}