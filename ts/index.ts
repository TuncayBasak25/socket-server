import WebSocket, { WebSocketServer } from 'ws';
import { parseJson } from './parseJson';

export class Socket {
    private static server?: WebSocketServer;
    
    private static socketCount = 0;
    private static readonly sockets: Map<number, Socket> = new Map();
    private static readonly methods: { [key: string]: (socket: Socket, data: any) => void } = {};

    public static listen(port: number) {
        const PORT = process.env.PORT || port;
        this.server = new WebSocketServer({ port: Number(PORT) });

        this.server.on('listening', () => console.log(`WebSocket server is running on ws://localhost:${PORT}`));
        this.server.on('connection', (webSocket) => new Socket(webSocket));
    }

    static get(id: number) {
        return this.sockets.get(id);
    }
    
    readonly id: number;
    readonly data: { [key: string]: any } = {};
    protected constructor(private readonly webSocket: WebSocket) {
        this.id = Socket.socketCount++;
        Socket.sockets.set(this.id, this);

        webSocket.on("message", (rawData) => this.handleMessage(rawData.toString()));

        webSocket.on("close", () => Socket.sockets.delete(this.id));
    }

    sendMessage(method: string, body: any) {
        this.webSocket.send(JSON.stringify({
            method,
            body
        }));
    }

    sendError(errorBody: any) {
        this.sendMessage("error", errorBody);
    }

    private handleMessage(message: string) {
        const data = parseJson(message);

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

