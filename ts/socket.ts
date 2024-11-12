import { WebSocket } from "ws";

export interface Socket {
    readonly id: number,
    do(method: string): void;
    set(key: number | string, value: any): void;
    get<T = any>(key: number | string): T;
}

export namespace Socket {
    export function create(id: number, webSocket: WebSocket, methods: { [key: string]: (socket: Socket) => void }) {
        const data = new Map<number | string, any>();

        const socket = {
            id,
            do: (method: string) => webSocket.send(JSON.stringify({ method })),
            set: (key: number | string, value: any) => {
                data.set(key, value);
                webSocket.send(JSON.stringify({ set: { key, value } }));
            },
            get: <T = any>(key: number | string) => data.get(key) as T
        };

        webSocket.on("message", rawdata => {
            const { method, set } = JSON.parse(rawdata.toString());

            set && data.set(set.key, set.value);
            method && methods[method](socket);
        });

        return socket;
    }
}