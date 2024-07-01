'use client';

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface StockData {
    symbol: string;
    price: number | null;
    change: number | null;
}

interface StockChartProps {
    data: StockData;
}

export default function StockChart({ data }: StockChartProps) {
    if (data.price === null) {
        return <div>No data available for {data.symbol}</div>;
    }

    const basePrice = data.price;
    const chartData = {
        labels: ['1m', '2m', '3m', '4m', '5m'],
        datasets: [
            {
                label: data.symbol,
                data: [basePrice,
                    basePrice * (1 + Math.random() * 0.1),
                    basePrice * (1 + Math.random() * 0.2),
                    basePrice * (1 + Math.random() * 0.3),
                    basePrice * (1 + Math.random() * 0.4)],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `${data.symbol} Stock Price`,
            },
        },
    };

    return <Line options={options} data={chartData} />;
}