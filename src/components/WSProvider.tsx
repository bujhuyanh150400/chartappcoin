import {useEffect} from "react";
import {WS_URL} from "../lib/constant.ts";
import {useWebSocketStore} from "../lib/store/useWsStore.tsx";

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const setWs = useWebSocketStore((s) => s.setWs);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        setWs(ws);
        return () => {
            ws.close();
        };
    }, [setWs]);
    return (
        <>
            {children}
        </>
    );
};
