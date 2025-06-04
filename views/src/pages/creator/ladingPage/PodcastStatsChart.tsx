import React, { useState } from 'react';
import {
    Chart as ChartJS,
    LineElement,
    BarElement,
    ArcElement,
    PointElement,
    RadarController,
    RadialLinearScale,
    LinearScale,
    Title,
    CategoryScale,
    Legend,
    Tooltip,
    Filler,
    ChartOptions,
    ChartData,
    BarController,
    DoughnutController,
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
    LineElement,
    BarElement,
    ArcElement,
    PointElement,
    RadarController,
    RadialLinearScale,
    LinearScale,
    Title,
    CategoryScale,
    Legend,
    Tooltip,
    Filler,
    zoomPlugin,
    BarController,
    DoughnutController
);

type ChartType = 'line' | 'bar' | 'radar' | 'doughnut';

type PodcastStatsChartProps = {
    labels: string[];
    views: number[];
    likes: number[];
    comments: number[];
};

const chartComponentMap = {
    line: Line,
    bar: Bar,
    radar: Radar,
    doughnut: Doughnut,
};

const PodcastStatsChart: React.FC<PodcastStatsChartProps> = ({ labels, views, likes, comments }) => {
    const [chartType, setChartType] = useState<ChartType>('line');

    const data: ChartData<any> = {
        labels,
        datasets: [
            {
                label: 'Views',
                data: views,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                fill: true,
            },
            {
                label: 'Likes',
                data: likes,
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1,
                fill: true,
            },
            {
                label: 'Comments',
                data: comments,
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
                fill: true,
            },
        ],
    };

    const options: ChartOptions<any> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#374151',
                },
            },
            title: {
                display: true,
                text: 'Podcast Statistics by Day',
                color: '#1f2937',
                font: {
                    size: 18,
                },
            },
            zoom: chartType === 'line' || chartType === 'bar' ? {
                pan: { enabled: true, mode: 'x' },
                zoom: {
                    wheel: { enabled: true },
                    pinch: { enabled: true },
                    mode: 'x',
                },
                limits: {
                    x: { min: 0, max: labels.length - 1 },
                },
            } : undefined,
        },
        scales: chartType !== 'doughnut' ? {
            x: {
                ticks: { color: '#6b7280' },
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#6b7280' },
            },
        } : {},
    };

    const ChartComponent = chartComponentMap[chartType];

    return (
        <div className="bg-white rounded-2xl p-4 w-full" style={{ minHeight: 460 }}>
            <div className="mb-4 flex items-center gap-2">
                <label htmlFor="chart-type" className="text-sm font-medium text-gray-700">Chart Type:</label>
                <select
                    id="chart-type"
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as ChartType)}
                >
                    <option value="line">Line</option>
                    <option value="bar">Bar</option>
                    <option value="radar">Radar</option>
                    <option value="doughnut">Doughnut</option>
                </select>
            </div>
            <div className="w-full" style={{ height: '400px' }}>
                <ChartComponent data={data} options={options} />
            </div>
        </div>
    );
};

export default PodcastStatsChart;
