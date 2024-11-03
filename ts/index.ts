import WebSocket, { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8080;
const server = new WebSocketServer({ port: Number(PORT) });

server.on('listening', () => {
    console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});

server.on('connection', (socket) => {
    Socket.create(socket);
});

type MessageStatus = "ok" | "error";

class Socket {
    static instances: Map<number, Socket> = new Map();
    private static count = 0;

    static create(socket: WebSocket) {
        this.instances.set(this.count, new this(socket));
        this.count++;
    }

    static delete(id: number) {
        this.instances.delete(id);
    }

    static get(id: number) {
        return this.instances.get(id);
    }

    private readonly socket: WebSocket;
    private readonly id: number;
    private readonly methods: { [key: string]: (data: any) => void } = {};

    private constructor(socket: WebSocket) {
        this.socket = socket;
        this.id = Socket.count;

        socket.on("open", () => {
            this.onOpen();
        })

        socket.on("message", (data) => {
            this.handle(JSON.parse(data.toString()));
        });

        socket.on("close", () => {
            this.onClose();
            Socket.delete(this.id);
        });
    }


    setMethod(name: string, func: (data: any) => void) {
        this.methods[name] = func;
    }

    onOpen() {
        //for derived class
    }

    onClose() {
        //For derived class
    }

    private handle(data: any) {
        if (typeof data.method != "string") {
            return this.sendMessage("error", "You have to specify a 'method' attribute implemented by the server!");
        }
        if (!this.methods[data.method]) {
            return this.sendMessage("error", `No implementation for 'method' ${data.method}!`);
        }
        this.methods[data.action](data);
    }

    sendMessage(key: MessageStatus, value: any) {
        const obj: { [key: string]: any } = {};
        obj[key] = value;
        this.socket.send(JSON.stringify(obj));
    }
}