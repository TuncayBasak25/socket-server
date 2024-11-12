import { WebSocketServer } from "ws";
import { Socket } from "./socket";

export namespace SocketServer {
    let socketCount = 0;
    const sockets = new Map<number, Socket>();
    export const methods: { [key: string]: (socket: Socket) => void } = {};

    export function start(port: string | number) {
        const PORT = Number(process.env.PORT || port);
        const server = new WebSocketServer({ port: PORT });

        server.on('listening', () => console.log(`WebSocket server is running on ws://localhost:${PORT}`));
        server.on('connection', (webSocket) => Socket.create(socketCount++, webSocket, methods));
    }
}