import type {TimeSeriesRequest} from "../lib/api/@type.ts";
import {useEffect, useState} from "react";
import useSubscribeSymbols from "./useSubscribeSymbols.tsx";
import type {CandlestickData, LineData, UTCTimestamp} from "lightweight-charts";
import {useQuery} from "@tanstack/react-query";
import twelveAPI from "../lib/api/twelveapi.ts";
import {formatDataCandleChart, formatDataLineChart, getBucketTime} from "../lib/utils.ts";

type Params = {
    symbol?: string;
    interval: TimeSeriesRequest['interval'];
    user_id?: string;
    secret?: string;
};

const updateCandleChartData = (
    prev: CandlestickData<UTCTimestamp>[],
    price: number,
    bucketTime: UTCTimestamp,
    interval: TimeSeriesRequest['interval']
): CandlestickData<UTCTimestamp>[] => {
    if (!prev.length) return prev;
    const last = prev[prev.length - 1];
    const lastBucket = getBucketTime(last.time, interval);
    if (bucketTime === lastBucket) {
        const updated = {
            ...last,
            high: Math.max(last.high, price),
            low: Math.min(last.low, price),
            close: price,
        };
        return [...prev.slice(0, -1), updated];
    } else if (bucketTime > lastBucket) {
        const newCandle: CandlestickData<UTCTimestamp> = {
            time: bucketTime,
            open: price,
            high: price,
            low: price,
            close: price,
        };
        return [...prev, newCandle];
    }
    return prev;
};

const updateLineChartData = (
    prev: LineData<UTCTimestamp>[],
    price: number,
    bucketTime: UTCTimestamp,
    interval: TimeSeriesRequest['interval']
): LineData<UTCTimestamp>[] => {
    if (!prev.length) return prev;
    const last = prev[prev.length - 1];
    const lastBucket = getBucketTime(last.time, interval);
    if (bucketTime === lastBucket) {
        const updated = {...last, value: price};
        return [...prev.slice(0, -1), updated];
    } else if (bucketTime > lastBucket) {
        return [...prev, {time: bucketTime, value: price}];
    }
    return prev;
};



const useTrading = ({symbol, interval, user_id, secret}: Params) => {
    const [loading, setLoading] = useState<boolean>(false);

    const [candleData, setCandleData] = useState<CandlestickData<UTCTimestamp>[]>([]);
    const [lineData, setLineData] = useState<LineData<UTCTimestamp>[]>([]);

    const {data, isLoading, isRefetching, isError} = useQuery({
        queryKey: ['twelveAPI-timeSeries', symbol, interval],
        enabled: !!symbol,
        queryFn: async () => {
            return await twelveAPI.timeSeries({
                symbol: symbol || '',
                interval,
                outputsize: 300,
                order: 'ASC',
            });
        },
        select: (res) => res.values ?? [],
    });

    // set loading
    useEffect(() => {
        setLoading(isLoading || isRefetching);
    }, [isLoading, isRefetching]);

    // set data
    useEffect(() => {
        if (!data || !data.length) return;
        setCandleData(formatDataCandleChart(data));
        setLineData(formatDataLineChart(data));
    }, [data]);

    // get realtime (lấy từ ws và cập nhật dữ liệu realtime)
    const priceRealtime = useSubscribeSymbols(symbol, user_id, secret);
    // get realtime price from websocket store zustand

    useEffect(() => {
        if (!priceRealtime) return;
        const price = priceRealtime.price;
        const bucketTime = getBucketTime(priceRealtime.timestamp, interval);
        setCandleData((prev) => {
            return updateCandleChartData(prev, price, bucketTime, interval)
        });
        setLineData((prev) => {
            return updateLineChartData(prev, price, bucketTime, interval)
        });
    }, [priceRealtime, symbol, interval]);

    return {
        loading,
        lineData: lineData,
        candleData: candleData,
        priceRealtime,
        isError
    };
}

export default useTrading;