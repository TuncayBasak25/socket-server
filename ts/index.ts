import WebSocket, { WebSocketServer } from 'ws';
import { parseJson } from './parseJson';

export class Socket {
    private static server?: WebSocketServer;
    
    private static socketCount = 0;
    static readonly sockets: Map<number, Socket> = new Map();
    static readonly methods: { [key: string]: (socket: Socket, data: any) => void } = {};

    public static listen(port: number) {
        const PORT = process.env.PORT || port;
        this.server = new WebSocketServer({ port: Number(PORT) });

        this.server.on('listening', () => console.log(`WebSocket server is running on ws://localhost:${PORT}`));
        this.server.on('connection', (webSocket) => new Socket(webSocket));
    }

    static get(id: number) {
        return this.sockets.get(id);
    }

    static registerMethod(name: string, method: (socket: Socket, data: any) => void) {
        this.methods[name] = method;
    }
    
    readonly id: number;
    readonly data: Map<string, any> = new Map();
    protected constructor(private readonly webSocket: WebSocket) {
        this.id = Socket.socketCount++;
        Socket.sockets.set(this.id, this);

        webSocket.on("message", (rawData) => this.handleMessage(rawData.toString()));

        webSocket.on("close", () => Socket.sockets.delete(this.id));
    }

    set(key: string, value: any) {
        this.data.set(key, value);
    }

    get(key: string) {
        return this.data.get(key);
    }

    delete(key: string) {
        this.data.delete(key);
    }

    send(method: string, body: any) {
        this.webSocket.send(JSON.stringify({
            method,
            body
        }));
    }

    query(key: string) {
        this.send("query", key);
    }

    error(errorBody: any) {
        this.send("error", errorBody);
    }

    private handleMessage(message: string) {
        const data = parseJson(message);

        if (!data) {
            return this.error("Unvalid JSON format!");
        }
        const { method, body, set, get } = data;

        method && Socket.methods[method](this, body);

        if (typeof set == "object") {
            if (typeof set.key != "string") {
                return this.error("Unvalid set!")
            }
            this.set(set.key, set.value);
        }

        if (typeof get == "string") {
            this.send("get", this.get(get));
        }
    }
}

