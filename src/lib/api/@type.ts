export  enum _Timeframe {
    OneMinute = '1min',
    FiveMinute = '5min',
    FifteenMinutes = '15min',
    ThirtyMinutes = '30min',
    FortyFiveMinutes = '45min',
    OneHour = '1h',
    OneDay = '1day',
    OneWeek = '1week',
}

export type TimeSeriesRequest = {
    symbol: string,
    interval: _Timeframe,
    outputsize: number,
    order: 'ASC' | 'DESC',
    startdate?: string,
    enddate?: string
}
export type TimeSeriesResponse = {
    meta: {
        symbol: string;
        interval: string;
        currency: string | null;
        exchangeTimezone: string | null;
        exchange: string;
        micCode: string | null;
        currencyBase: string;
        currencyQuote: string;
        type: string;
    };
    values: TimeSeriesItem[];
    status: string;
};

export type TimeSeriesItem = {
    datetime: {
        date: string; // ISO format "2025-07-14 10:37:00.000000"
        timezone_type: number;
        timezone: string; // e.g., "UTC"
    };
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string | null;
};