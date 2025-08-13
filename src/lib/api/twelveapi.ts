import {client} from "./client.ts";
import type {GetOpenRequest, GetOpenResponseType, TimeSeriesRequest, TimeSeriesResponse} from "./@type.ts";

const twelveAPI = {
    timeSeries: async (params: TimeSeriesRequest): Promise<TimeSeriesResponse> => {
        const response = await client.get('/time_series', {params});
        return response.data;
    },

    getOpen: async (params: GetOpenRequest): Promise<GetOpenResponseType> => {
        const response = await client.get('/transaction/get-open', {params});
        return response.data;
    }
}
export default twelveAPI;

