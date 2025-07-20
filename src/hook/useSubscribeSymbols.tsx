import { useEffect, useState} from "react";
import {useWebSocketStore} from "../lib/store/useWsStore.tsx";

export type SymbolPrice = {
    symbol: string;
    timestamp: number;
    price: number;
    percent: number | null;
};

const useSubscribeSymbols = (symbols?: string, userId?: string, secret?: string) => {
    const ws = useWebSocketStore((s) => s.ws);

    const [price, setPrice] = useState<SymbolPrice | null>(null);

    useEffect(() => {
        if (!ws) return;

        const handleOpen = () => {
            ws.send(JSON.stringify({
                action: 'subscribe',
                params: { user_id: userId, secret, symbols },
            }));
        };

        const handleMessage = (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data);
                if (data.symbol && data.price) {
                    setPrice({
                        symbol: data.symbol,
                        timestamp: data.timestamp,
                        price: parseFloat(data.price),
                        percent: data.percent ?? null,
                    });
                }
            } catch (err) {
                console.error("Parse error:", err);
            }
        };


        if (ws.readyState === WebSocket.OPEN) {
            handleOpen();
        } else {
            ws.addEventListener('open', handleOpen);
        }
        ws.addEventListener('message', handleMessage);

        return () => {
            ws.removeEventListener('open', handleOpen);
            ws.removeEventListener('message', handleMessage);
        };
    }, [ws, userId, secret, symbols]);


    return price;
}
export default useSubscribeSymbols;