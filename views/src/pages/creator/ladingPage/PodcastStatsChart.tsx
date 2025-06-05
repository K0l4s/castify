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
    { key: 'views', label: 'Views' },
    { key: 'likes', label: 'Likes' },
    { key: 'comments', label: 'Comments' },
] as const;

type DatasetKey = typeof DATASET_KEYS[number]['key'];

const PodcastStatsChart: React.FC<PodcastStatsChartProps> = ({ labels, views, likes, comments }) => {
    const [chartType, setChartType] = useState<ChartType>('line');
    const [visibleDatasets, setVisibleDatasets] = useState<DatasetKey[]>(['views', 'likes', 'comments']);

    const handleCheckboxChange = (key: DatasetKey) => {
        setVisibleDatasets((prev) =>
            prev.includes(key)
                ? prev.filter((k) => k !== key)
                : [...prev, key]
        );
    };

    const handleCheckAll = (checked: boolean) => {
        setVisibleDatasets(checked ? DATASET_KEYS.map(d => d.key) : []);
    };

    const allChecked = visibleDatasets.length === DATASET_KEYS.length;
    const someChecked = visibleDatasets.length > 0 && !allChecked;

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
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as ChartType)}
                >
                    <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value="line">Line</option>
                    <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value="bar">Bar</option>
                    <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value="radar">Radar</option>
                    <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value="doughnut">Doughnut</option>
                </select>
                <div className="flex items-center ml-6 gap-2">
                    <input
                        type="checkbox"
                        id="check-all"
                        checked={allChecked}
                        ref={el => {
                            if (el) el.indeterminate = someChecked;
                        }}
                        onChange={e => handleCheckAll(e.target.checked)}
                    />
                    <label htmlFor="check-all" className="text-sm">All</label>
                    {DATASET_KEYS.map(ds => (
                        <span key={ds.key} className="flex items-center gap-1 ml-2">
                            <input
                                type="checkbox"
                                id={`show-${ds.key}`}
                                checked={visibleDatasets.includes(ds.key)}
                                onChange={() => handleCheckboxChange(ds.key)}
                            />
                            <label htmlFor={`show-${ds.key}`} className="text-sm">{ds.label}</label>
                        </span>
                    ))}
                </div>
            </div>
            <div className="w-full" style={{ height: '400px' }}>
                <ChartComponent data={data} options={options} />
            </div>
        </div>
    );
};

export default PodcastStatsChart;
