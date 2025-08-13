import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {
    AreaSeries,
    CandlestickSeries,
    ColorType,
    createChart,
    type IChartApi, type IPriceLine,
    type ISeriesApi,
    LineStyle,
} from "lightweight-charts";
import useTrading from "../hook/useTrading.tsx";
import {_Timeframe} from "../lib/api/@type.ts";
import dayjs from "dayjs";
import useGetOpenTrans from "../hook/useGetOpenTrans.tsx";


const convertDate = (interval: _Timeframe, timestamp: number) => {
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
    interface Document {
        ReactNativeWebView?: {
            postMessage: (message: string) => void;
        };
    }
}

const Chart = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    const chartRef = useRef<IChartApi>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Area'>>(null);

    const [symbol, setSymbol] = useState<string>("");
    const [interval, setInter] = useState<_Timeframe>(_Timeframe.OneMinute);
    const [chartType, setChartType] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [secret, setSecret] = useState<string>("");
    const [ready, setReady] = useState<boolean>(false);

    const hookGetOpen = useGetOpenTrans({
        user_id: userId,
        secret: secret,
        symbol: symbol,
        // symbol: 'BTC/USD',
        // user_id: "20"
        // secret: "bcb07026-c537-4cbb-9024-761dc1c50727"
    })

    useLayoutEffect(() => {
        setTimeout(() => {
            if (window?.ReactNativeWebView?.postMessage) {
                window?.ReactNativeWebView.postMessage('READY');
            }
            if (document?.ReactNativeWebView?.postMessage) {
                document?.ReactNativeWebView.postMessage('READY');
            }
        }, 500); // delay nhẹ cho chắc
    }, []);


    useEffect(() => {
        const handler = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                if (data) {
                    if (data.type == "PAYLOAD") {
                        setSymbol(data.symbol || '');
                        setInter(data.interval || _Timeframe.OneMinute);
                        setChartType(data.chartType || '');
                        setUserId(data.user_id || '');
                        setSecret(data.secret || '');
                    }
                    if (data.type == "RELOAD_OPEN_TRANS") {
                        hookGetOpen.refetch();
                    }
                }
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
        // symbol: 'BTC/USD',
        // interval: _Timeframe.FiveMinute,
        // user_id: "20",
        // secret: "bcb07026-c537-4cbb-9024-761dc1c50727"
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
                timeScale: {
                    borderVisible: false,            // ẩn viền trục X
                    borderColor: 'rgba(0,0,0,0)',
                },
            });
            chart.timeScale().setVisibleLogicalRange({
                from: 0,
                to: 30,
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
                series = chart.addSeries(AreaSeries, {
                    lineWidth: 2,
                    lineColor: "#2962FF",
                    topColor: 'rgba(41, 98, 255, 0.5)',
                    bottomColor: 'rgba(41, 98, 255, 0.1)',
                    lineStyle: LineStyle.Solid,
                });
            } else {
                series = chart.addSeries(CandlestickSeries, {});
            }
            seriesRef.current = series;
            setReady(true);
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

    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.timeScale().scrollToRealTime()
        }
    }, [chartType]);

    useEffect(() => {
        hookGetOpen.refetch();
    }, [hookGetOpen, symbol,
        interval,
        chartType,
        userId,
        secret
    ]);

    useEffect(() => {
        if (!(Array.isArray(hookGetOpen.data) && hookGetOpen.data.length > 0)) {
            return;
        }
        let createdLines: IPriceLine[] = [];
        const setLine = setTimeout(() => {
            createdLines = hookGetOpen.data ? hookGetOpen.data.map((item) => {
                return seriesRef.current!.createPriceLine({
                    price: Number(item.entry_price),
                    color: 'red',
                    lineWidth: 2,
                    lineStyle: LineStyle.Dotted,
                    axisLabelVisible: true,
                    title: `Chốt: ${item.volume}`,
                    id: `open-${item.id}`,      // phần này tùy chọn, giúp dễ debug
                });
            }) : [];
        }, 500)

        return () => {
            createdLines.forEach(line => {
                seriesRef.current?.removePriceLine(line);
            });
            clearTimeout(setLine);
        };
    }, [hookGetOpen.data, ready, loading, chartType]);

    useEffect(() => {
        if (chartRef.current && !loading && !isError) {
            chartRef.current.timeScale().scrollToRealTime();
        }
    }, [loading, isError]);

    useEffect(() => {
        if (loading){
            if (window?.ReactNativeWebView?.postMessage) {
                window?.ReactNativeWebView.postMessage('IS_LOADING');
            }
            if (document?.ReactNativeWebView?.postMessage) {
                document?.ReactNativeWebView.postMessage('IS_LOADING');
            }
        }else{
            if (window?.ReactNativeWebView?.postMessage) {
                window?.ReactNativeWebView.postMessage('IS_NOT_LOADING');
            }
            if (document?.ReactNativeWebView?.postMessage) {
                document?.ReactNativeWebView.postMessage('IS_NOT_LOADING');
            }
        }
        if (isError){
            if (window?.ReactNativeWebView?.postMessage) {
                window?.ReactNativeWebView.postMessage('IS_ERROR');
            }
            if (document?.ReactNativeWebView?.postMessage) {
                document?.ReactNativeWebView.postMessage('IS_ERROR');
            }
        }else{
            if (window?.ReactNativeWebView?.postMessage) {
                window?.ReactNativeWebView.postMessage('IS_NOT_ERROR');
            }
            if (document?.ReactNativeWebView?.postMessage) {
                document?.ReactNativeWebView.postMessage('IS_NOT_ERROR');
            }
        }
    }, [loading, isError])

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
            </div>

            }
            <div
                ref={chartContainerRef}
                style={{
                    overflowY: 'hidden',
                    width: '100%',
                    height: '100vh',
                    visibility: !loading && !isError ? 'visible' : 'hidden',
                }}
            />
            {!loading &&
                (
                    <button
                        onClick={() => {
                            if (chartRef.current && !loading && !isError) {
                                chartRef.current.timeScale().scrollToRealTime();
                            }
                        }}
                        style={{
                            position: 'fixed',
                            bottom: '40px',
                            right: '90px',
                            backgroundColor: '#fff',
                            color: 'black',
                            border: 'none',
                            borderRadius: '100%',
                            cursor: 'pointer',
                            boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                            width: 35,
                            height: 35,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderStyle: 'solid',
                            zIndex: 100_000,
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"
                             viewBox="0 0 16 16">
                            <path fill-rule="evenodd"
                                  d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"/>
                            <path fill-rule="evenodd"
                                  d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"/>
                        </svg>
                    </button>
                )}
        </>
    );
};

export default Chart