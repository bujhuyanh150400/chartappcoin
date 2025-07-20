import {_Timeframe, type TimeSeriesItem} from "./api/@type.ts";
import type {CandlestickData, LineData, UTCTimestamp} from "lightweight-charts";
import dayjs from 'dayjs';

export const getBucketTime = (timestamp: number, timeframe: _Timeframe): UTCTimestamp  => {
    const minutesMap: Record<_Timeframe, number> = {
        [_Timeframe.OneMinute]: 1,
        [_Timeframe.FiveMinute]: 5,
        [_Timeframe.FifteenMinutes]: 15,
        [_Timeframe.ThirtyMinutes]: 30,
        [_Timeframe.FortyFiveMinutes]: 45,
        [_Timeframe.OneHour]: 60,
        [_Timeframe.OneDay]: 1440,
        [_Timeframe.OneWeek]: 10080,
    };
    // Default to 1 minute if timeframe is not recognized
    const bucketSeconds = (minutesMap[timeframe] || 1) * 60;
    return Math.floor(timestamp / bucketSeconds) * bucketSeconds as UTCTimestamp
}

export const formatDataCandleChart = (data: TimeSeriesItem[]): CandlestickData<UTCTimestamp>[] => {
    return data.map((c) => {
        return {
            time: dayjs(c.datetime.date).unix() as UTCTimestamp,
            open: parseFloat(c.open),
            high: parseFloat(c.high),
            low: parseFloat(c.low),
            close: parseFloat(c.close),
        };
    });
}

export const formatDataLineChart = (data: TimeSeriesItem[]): LineData<UTCTimestamp>[] => {
    return data.map((c) => {
        return {
            time: dayjs(c.datetime.date).unix() as UTCTimestamp,
            value: parseFloat(c.close),
        };
    });
}