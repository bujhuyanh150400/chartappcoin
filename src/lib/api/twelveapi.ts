import {client} from "./client.ts";
import type {TimeSeriesRequest, TimeSeriesResponse} from "./@type.ts";

const twelveAPI = {
    timeSeries: async (params: TimeSeriesRequest): Promise<TimeSeriesResponse> => {
        const response = await client.get('/time_series', {params});
        return response.data;
    }
}
export default twelveAPI;