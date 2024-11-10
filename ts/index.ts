import WebSocket, { WebSocketServer } from 'ws';
import { parseJson } from './parseJson';

type Method = "error" | "action" | "get" | "set";

export class Socket {
    private static server?: WebSocketServer;
    
    private static socketCount = 0;
    static readonly sockets: Map<number, Socket> = new Map();
    static readonly actions: { [key: string]: (socket: Socket, data: any) => void } = {};

    public static listen(port: number) {
        const PORT = process.env.PORT || port;
        this.server = new WebSocketServer({ port: Number(PORT) });

        this.server.on('listening', () => console.log(`WebSocket server is running on ws://localhost:${PORT}`));
        this.server.on('connection', (webSocket) => new Socket(webSocket));
    }

    static get(id: number) {
        return this.sockets.get(id);
    }

    static getList(idList: number[]) {
        const socketList = [];
        for (const id of idList) {
            const socket = this.get(id);
            if (socket)
                socketList.push(socket);
        }
        return socketList;
    }
    
    readonly id: number;
    readonly data: Map<string | number, any> = new Map();
    protected constructor(private readonly webSocket: WebSocket) {
        this.id = Socket.socketCount++;
        Socket.sockets.set(this.id, this);

        webSocket.on("message", (rawData) => this.handleMessage(rawData.toString()));

        webSocket.on("close", () => Socket.sockets.delete(this.id));
    }

    private send(method: Method, body: any) {
        const data: any = {};
        data[method] = body;
        this.webSocket.send(JSON.stringify(data));
    }

    sendAction(action: string, body: any = {}) {
        this.send("action", { action, body })
    }

    sendSet(key: number | string, value: any) {
        this.send("set", {
            key,
            value
        });
    }

    sendGet(key: number | string) {
        this.send("get", key);
    }

    sendError(errorBody: any = {}) {
        this.send("error", { error: errorBody });
    }

    private handleMessage(message: string) {
        const data = parseJson(message);

        if (!data) {
            return this.sendError("Unvalid JSON format!");
        }
        const { action, get, set } = data;

        if (action) {
            if (typeof action.action != "string") {
                return this.sendError(`No action!`)
            }
            if (!Socket.actions[action.action]) {
                return this.sendError(`No action named [${action.action}]`)
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

