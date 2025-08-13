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
    enddate?: string,
    timezone?:string
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
export enum _TradeType {
    BUY = 0,
    SELL = 1,
}
export enum _TransactionTriggerType {
    TYPE_TRIGGER_NOW = 1,
    TYPE_TRIGGER_AUTO_TRIGGER = 2,
    TYPE_TRIGGER_LOW_BUY = 3,
    TYPE_TRIGGER_HIGH_BUY = 4
}

export enum _TransactionStatus {
    OPEN = 1,
    CLOSED = 2,
    WAITING = 3,
}
export type Symbol = {
    'id': number,
    'symbol': string,
    'currency_base': string,
    'currency_quote': string| null,
    'spread': string, // float number
    'type': _AssetType
}
export enum _AssetType {
    CRYPTO = 1,
    ENERGY = 2,
    METAL = 3,
    FAVORITE = 5,
}
export type Transaction = {
    "id": number,
    "type": _TradeType,
    "volume": number,
    "code": string,
    "type_trigger": _TransactionTriggerType,
    "entry_price": number,
    "close_price": number | null,
    "trigger_price": number | null,
    "take_profit": number | null,
    "stop_loss": number | null,
    "status": _TransactionStatus,
    "open_at": string | null, // ISO 8601 format
    "trigger_at": string | null, // ISO 8601 format
    "close_at": string | null, // ISO 8601 format
    symbol: Symbol
}

export type GetOpenRequest = {
    user_id: string,
    secret: string,
    symbol:string,
}

export type GetOpenResponseType = {
    message: string,
    data: Transaction[]
}
