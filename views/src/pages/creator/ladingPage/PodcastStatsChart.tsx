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

const DATASET_KEYS = [
    { key: 'views', label: 'Views', color: 'bg-blue-500', border: 'border-blue-500' },
    { key: 'likes', label: 'Likes', color: 'bg-green-500', border: 'border-green-500' },
    { key: 'comments', label: 'Comments', color: 'bg-red-500', border: 'border-red-500' },
] as const;

type DatasetKey = typeof DATASET_KEYS[number]['key'];

const useDarkMode = () => {
    const [isDark, setIsDark] = React.useState(
        typeof window !== 'undefined'
            ? document.documentElement.classList.contains('dark')
            : false
    );
    React.useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    return isDark;
};

const PodcastStatsChart: React.FC<PodcastStatsChartProps> = ({ labels, views, likes, comments }) => {
    const [chartType, setChartType] = useState<ChartType>('line');
    const [visibleDatasets, setVisibleDatasets] = useState<DatasetKey[]>(['views', 'likes', 'comments']);
    const isDark = useDarkMode();

    const handleCardClick = (key: DatasetKey) => {
        setVisibleDatasets((prev) =>
            prev.includes(key)
                ? prev.filter((k) => k !== key)
                : [...prev, key]
        );
    };

    const datasets = [
        {
            key: 'views',
            label: 'Views',
            data: views,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            fill: true,
        },
        {
            key: 'likes',
            label: 'Likes',
            data: likes,
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1,
            fill: true,
        },
        {
            key: 'comments',
            label: 'Comments',
            data: comments,
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1,
            fill: true,
        },
    ].filter(ds => visibleDatasets.includes(ds.key as DatasetKey));

    const data: ChartData<any> = {
        labels,
        datasets,
    };

    const options: ChartOptions<any> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: isDark ? '#d1d5db' : '#374151',
                },
            },
            title: {
                display: true,
                text: 'Podcast Statistics by Day',
                color: isDark ? '#f3f4f6' : '#1f2937',
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
                ticks: { color: isDark ? '#9ca3af' : '#6b7280' },
                grid: {
                    color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                },
            },
            y: {
                beginAtZero: true,
                ticks: { color: isDark ? '#9ca3af' : '#6b7280' },
                grid: {
                    color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                },
            },
        } : {},
    };

    const ChartComponent = chartComponentMap[chartType];

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 w-full" style={{ minHeight: 460 }}>
            <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="chart-type" className="text-sm font-medium text-gray-700 dark:text-gray-200">Chart Type:</label>
                    <select
                        id="chart-type"
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value as ChartType)}
                    >
                        <option value="line">Line</option>
                        <option value="bar">Bar</option>
                        <option value="radar">Radar</option>
                        <option value="doughnut">Doughnut</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    {DATASET_KEYS.map(ds => {
                        const selected = visibleDatasets.includes(ds.key);
                        return (
                            <button
                                key={ds.key}
                                type="button"
                                onClick={() => handleCardClick(ds.key)}
                                className={`
                                    flex flex-col items-center px-4 py-2 rounded-lg border-2 cursor-pointer transition
                                    ${selected ? `${ds.color} text-white ${ds.border}` : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-transparent'}
                                    hover:shadow-md
                                `}
                                style={{ minWidth: 90 }}
                                title={ds.label}
                            >
                                {ds.key === 'views' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.458 12C2.732 7.943 6.523 5 12 5c5.477 0 9.268 2.943 10.542 7-1.274 4.057-5.065 7-10.542 7-5.477 0-9.268-2.943-10.542-7z" />
                                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} fill="none" />
                                    </svg>
                                )}
                                {ds.key === 'likes' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                                    </svg>
                                )}
                                {ds.key === 'comments' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4 1 1-4A8.96 8.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="w-full" style={{ height: '400px' }}>
                <ChartComponent data={data} options={options} />
            </div>
        </div>
    );
};

export default PodcastStatsChart;
