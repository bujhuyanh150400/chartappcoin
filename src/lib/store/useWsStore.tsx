import { create } from 'zustand';

type WebSocketStoreType = {
    ws: WebSocket | null;
    setWs: (ws: WebSocket) => void;
};

export const useWebSocketStore = create<WebSocketStoreType>((set) => ({
    ws: null,
    setWs: (ws) => set({ ws }),
}));