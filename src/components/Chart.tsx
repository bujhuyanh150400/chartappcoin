import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {
    CandlestickSeries,
    ColorType,
    createChart,
    type IChartApi,
    type ISeriesApi,
    LineSeries,
    LineStyle
} from "lightweight-charts";
import useTrading from "../hook/useTrading.tsx";
import {_Timeframe} from "../lib/api/@type.ts";
import dayjs from "dayjs";


const convertDate = (interval: _Timeframe, timestamp:number) => {
    const date = dayjs.unix(timestamp); // timestamp dạng UNIX (second)
    switch (interval) {
        case _Timeframe.OneMinute:
        case _Timeframe.FiveMinute:
        case _Timeframe.FifteenMinutes:
            return date.format('HH:mm');
        case _Timeframe.ThirtyMinutes:
        case _Timeframe.FortyFiveMinutes:
        case _Timeframe.OneHour:
            return date.format('HH:mm DD MMM ');
        case _Timeframe.OneDay:
            return date.format('DD MMM');
        case _Timeframe.OneWeek:
            return date.format('YYYY-MM-DD');
        default:
            return date.format('YYYY-MM-DD HH:mm');
    }
}
// Just to fix TS error
declare global {
    interface Window {
        ReactNativeWebView?: {
            postMessage: (message: string) => void;
        };
    }

}
const Chart = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'>>(null);

    const [symbol, setSymbol] = useState<string>("");
    const [interval, setInterval] = useState<_Timeframe>(_Timeframe.OneMinute);
    const [chartType, setChartType] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [secret, setSecret] = useState<string>("");

    useLayoutEffect(() => {
        setTimeout(() => {
            if (window?.ReactNativeWebView?.postMessage) {
                window?.ReactNativeWebView.postMessage('READY');
            }
        }, 100); // delay nhẹ cho chắc
    }, []);
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                setSymbol(data.symbol || '');
                setInterval(data.interval || _Timeframe.OneMinute);
                setChartType(data.chartType || '');
                setUserId(data.user_id || '');
                setSecret(data.secret || '');
            } catch (err) {
                console.error('Invalid message from RN:', err);
            }
        };
        window.addEventListener("message", handler); // iOS + web
        document.addEventListener("message", handler as EventListener); // for Android
        return () => {
            window.removeEventListener("message", handler);
            document.removeEventListener("message", handler as EventListener);
        };
    }, []);

    const {lineData, candleData, loading, isError} = useTrading({
        symbol: symbol,
        interval: interval,
        user_id: userId,
        secret: secret
    });

    useEffect(() => {
            if (!chartContainerRef.current) return;

            const chart = createChart(chartContainerRef?.current, {
                layout: {
                    background: {type: ColorType.Solid, color: "#fff"},
                    textColor: "#000",
                },
                width: chartContainerRef.current?.clientWidth,
                height: window.innerHeight,
                handleScroll: {
                    vertTouchDrag: false,
                },
                handleScale: {
                    axisPressedMouseMove: false,
                    mouseWheel: false,
                    pinch: false,
                },
            });
            chart.timeScale().setVisibleLogicalRange({
                from: 0,
                to: 30, // 👈 khoảng thời gian bạn muốn hiển thị (độ "zoom")
            });
            chart.applyOptions({
                timeScale: {
                    tickMarkFormatter: (timestamp: number) => {
                        return convertDate(interval, timestamp);
                    }
                },
                localization: {
                    timeFormatter: (timestamp: number) => {
                        return convertDate(interval, timestamp);
                    }
                }
            })
            chartRef.current = chart;
            let series;
            if (chartType === 'LINE') {
                series = chart.addSeries(LineSeries, {
                    lineWidth: 2,
                    color: '#2962FF',
                    lineStyle: LineStyle.Solid,
                });
            } else {
                series = chart.addSeries(CandlestickSeries, {});
            }
            seriesRef.current = series;
            return () => {
                chart.remove();
            };
        },
        [chartType, interval]
    );

    useEffect(() => {
        if (!seriesRef.current || !chartRef.current) return;

        if (chartType === 'LINE') {
            if (lineData && lineData.length > 0) {
                seriesRef.current.setData(lineData);
            }
        } else {
            if (candleData && candleData.length > 0) {
                seriesRef.current.setData(candleData);
            }
        }
    }, [chartType, lineData, candleData]);

    return (
        <>
            {loading && <div style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }}>
                <div className={"loader"}></div>
            </div>}
            <div
                ref={chartContainerRef}
                style={{
                    overflowY:'hidden',
                    width: '100%',
                    height: '100vh',
                    visibility: !loading && !isError ? 'visible' : 'hidden',
                }}
            />
        </>
    );
};

export default Chart