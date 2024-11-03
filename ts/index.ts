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
    private static readonly instances: Map<number, Socket> = new Map();
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
    

    registerMethod<DataType = any>(name: string, func: (data: DataType) => void, validate?: (data: any) => data is DataType) {
        this.methods[name] = (data: any) => {
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

    private handle(data: any) {
        const methodName = data.method;

        if (typeof methodName != "string") {
            return this.sendMessage("error", "You have to specify a 'method' attribute implemented by the server!");
        }
        if (!this.methods[methodName]) {
            return this.sendMessage("error", `No implementation for 'method' ${methodName}!`);
        }
        this.methods[methodName](data);
    }

    sendMessage(key: MessageStatus, value: any) {
        const obj: { [key: string]: any } = {};
        obj[key] = value;
        this.socket.send(JSON.stringify(obj));
    }
}