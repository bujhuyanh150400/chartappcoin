import {WS_URL} from "../constant.ts";

export type SymbolPrice = {
    symbol: string;
    timestamp: number;
    price: number;
    percent: number | null;
};

type Callback = (data: SymbolPrice) => void;

export const WSQuotePriceClient = (() => {
    let socket: WebSocket | null = null;
    const callbacks: Callback[] = [];
    const subscribedSymbols = new Set<string>();

    const connect = () => {
        if (socket) return;

        socket = new WebSocket(WS_URL);

        socket.onopen = () => {
            console.log('[WebSocket] Connected');
            subscribedSymbols.forEach(sendSubscribe);
        };

        socket.onmessage = (event) => {
            const data: SymbolPrice = JSON.parse(event.data);
            callbacks.forEach(cb => cb(data));
        };

        socket.onclose = () => {
            console.log('[WebSocket] Closed');
            socket = null;
            // Optional: auto-reconnect
            setTimeout(connect, 2000);
        };

        socket.onerror = (err) => {
            console.error('[WebSocket] Error:', err);
        };
    };

    const disconnect = () => {
        socket?.close();
        socket = null;
    };

    const onMessage = (callback: Callback) => {
        callbacks.push(callback);
    };

    const subscribe = (symbol: string) => {
        if (subscribedSymbols.has(symbol)) {
            console.log(`[WebSocket] Symbol ${symbol} already subscribed`);
            return;
        }
        subscribedSymbols.add(symbol);
        sendSubscribe(symbol);
    };

    const unsubscribe = (symbol: string) => {
        if (!subscribedSymbols.has(symbol)) {
            console.log(`[WebSocket] Symbol ${symbol} was not subscribed`);
            return;
        }
        subscribedSymbols.delete(symbol);
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: 'unsubscribe', params: { symbols: symbol } }));
        }
    };
    const offMessage = (callback: Callback) => {
        const index = callbacks.indexOf(callback);
        if (index !== -1) callbacks.splice(index, 1);
    };

    const sendSubscribe = (symbol: string) => {
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: 'subscribe', params: { symbols: symbol } }));
        }
    };

    return {
        connect,
        disconnect,
        onMessage,
        subscribe,
        unsubscribe,
        offMessage
    };
})();
