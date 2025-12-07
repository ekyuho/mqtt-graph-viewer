import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    type ChartOptions,
    type ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface SensorChartProps {
    dataPoint: { timestamp: number; value: number } | null;
}

const MAX_DATA_POINTS = 50;

export const SensorChart: React.FC<SensorChartProps> = ({ dataPoint }) => {
    const [chartData, setChartData] = useState<ChartData<'line'>>({
        labels: [],
        datasets: [
            {
                label: '3T0 Value',
                data: [],
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.2)',
                tension: 0.4, // Smooth curves
                pointRadius: 4,
                pointBackgroundColor: '#0a0a0a',
                pointBorderColor: '#00d4ff',
                pointBorderWidth: 2,
                fill: true,
            },
        ],
    });

    useEffect(() => {
        if (dataPoint) {
            setChartData((prevData) => {
                const newLabels = [...(prevData.labels as string[]), format(dataPoint.timestamp, 'HH:mm:ss')];
                const newValues = [...(prevData.datasets[0].data as number[]), dataPoint.value];

                if (newLabels.length > MAX_DATA_POINTS) {
                    newLabels.shift();
                    newValues.shift();
                }

                return {
                    ...prevData,
                    labels: newLabels,
                    datasets: [
                        {
                            ...prevData.datasets[0],
                            data: newValues,
                        },
                    ],
                };
            });
        }
    }, [dataPoint]);

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#a1a1aa', // text-secondary
                    font: {
                        family: 'Inter',
                    }
                },
            },
            title: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(10, 10, 10, 0.8)',
                titleColor: '#fff',
                bodyColor: '#a1a1aa',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: '#a1a1aa',
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: '#a1a1aa',
                },
                beginAtZero: false, // Let the chart scale to the data range
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        animation: {
            duration: 500,
            easing: 'linear'
        }
    };

    return (
        <div style={{ height: '400px', width: '100%' }}>
            <Line options={options} data={chartData} />
        </div>
    );
};
