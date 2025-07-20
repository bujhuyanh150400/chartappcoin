import "./index.css"
import {WebSocketProvider} from "./components/WSProvider.tsx";
import Chart from "./components/Chart.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
    return (
        <WebSocketProvider>
            <QueryClientProvider client={queryClient}>
                <Chart></Chart>
            </QueryClientProvider>
        </WebSocketProvider>
    );
}

export default App
