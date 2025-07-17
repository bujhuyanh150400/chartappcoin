import {AreaSeries, createChart, ColorType, CandlestickSeries} from 'lightweight-charts';
import {useEffect, useRef} from 'react';
import "./index.css"

export const ChartComponent = (props) => {
    const {data} = props;

    const chartContainerRef = useRef<HTMLDivElement>(null);

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
                    vertTouchDrag:false,
                },
                handleScale: {
                    axisPressedMouseMove: false,
                    mouseWheel: false,
                    pinch: false,
                },
            });
            chart.timeScale().setVisibleLogicalRange({
                from: 0,
                to: 100, // 👈 khoảng thời gian bạn muốn hiển thị (độ "zoom")
            });

            const newSeries = chart.addSeries(CandlestickSeries, {
            });
            newSeries.setData(data);

            return () => {
                chart.remove();
            };
        },
        [data]
    );
    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100vh', // 👈 Cho container fill luôn màn hình
            }}
            ref={chartContainerRef}
        />
    );
};

const data = [{open: 10, high: 10.63, low: 9.49, close: 9.55, time: 1642427876}, {
    open: 9.55,
    high: 10.30,
    low: 9.42,
    close: 9.94,
    time: 1642514276
}, {open: 9.94, high: 10.17, low: 9.92, close: 9.78, time: 1642600676}, {
    open: 9.78,
    high: 10.59,
    low: 9.18,
    close: 9.51,
    time: 1642687076
}, {open: 9.51, high: 10.46, low: 9.10, close: 10.17, time: 1642773476}, {
    open: 10.17,
    high: 10.96,
    low: 10.16,
    close: 10.47,
    time: 1642859876
}, {open: 10.47, high: 11.39, low: 10.40, close: 10.81, time: 1642946276}, {
    open: 10.81,
    high: 11.60,
    low: 10.30,
    close: 10.75,
    time: 1643032676
}, {open: 10.75, high: 11.60, low: 10.49, close: 10.93, time: 1643119076}, {
    open: 10.93,
    high: 11.53,
    low: 10.76,
    close: 10.96,
    time: 1643205476
}];

function App() {

    return (
        <ChartComponent data={data}></ChartComponent>
    );
}

export default App
