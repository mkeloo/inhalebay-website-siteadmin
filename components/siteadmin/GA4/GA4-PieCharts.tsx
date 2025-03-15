import React, { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BreakdownItem {
    [key: string]: any;
}

interface GA4PieChartsProps {
    browserBreakdown: BreakdownItem[];
    deviceBreakdown: BreakdownItem[];
    isLoading?: boolean;
    error?: string | null;
}

interface PieChartComponentProps {
    title: string;
    breakdown: BreakdownItem[];
    labelKey: string;
    dataKey: string;
}

const PieChartComponent = ({
    title,
    breakdown,
    labelKey,
    dataKey,
}: PieChartComponentProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const labels = breakdown.map((item) => item[labelKey]);
        const dataValues = breakdown.map((item) => item[dataKey]);
        const chartData = {
            labels,
            datasets: [
                {
                    data: dataValues,
                    backgroundColor: [
                        '#36A2EB',
                        '#FF6384',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                    ],
                },
            ],
        };

        const chartInstance = new ChartJS(canvasRef.current, {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                },
            },
        });

        return () => {
            chartInstance.destroy();
        };
    }, [breakdown, labelKey, dataKey]);

    return (
        <Card className="w-full h-full border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm py-4">
            <CardHeader>
                <CardTitle className="text-3xl font-semibold text-gray-800 dark:text-gray-200 text-center">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="w-full flex items-center justify-center">
                <div className="w-60 h-60 lg:w-72 lg:h-72">
                    <canvas ref={canvasRef} className="w-full h-full" />
                </div>
            </CardContent>
        </Card>
    );
};

export default function GA4PieCharts({
    browserBreakdown,
    deviceBreakdown,
    isLoading = false,
    error = null,
}: GA4PieChartsProps) {
    const [showData, setShowData] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowData(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    const chartsData = [
        {
            title: 'Browsers',
            breakdown: browserBreakdown,
            labelKey: 'browser',
            dataKey: 'views',
        },
        {
            title: 'Devices',
            breakdown: deviceBreakdown,
            labelKey: 'device',
            dataKey: 'views',
        },
    ];

    if (error) {
        return (
            <Card className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4">
                <CardContent>
                    <p className="text-center text-red-600">Error: {error}</p>
                </CardContent>
            </Card>
        );
    }

    if (isLoading || !showData || !browserBreakdown || !deviceBreakdown) {
        return (
            <div className="w-full flex flex-col gap-4">
                {chartsData.map((chart, idx) => (
                    <Card
                        key={idx}
                        className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4 animate-pulse"
                    >
                        <CardHeader>
                            <div className="w-52 mx-auto text-center text-lg font-semibold bg-gray-300 dark:bg-gray-600 rounded py-2">
                                Loading...
                            </div>
                        </CardHeader>
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-72 h-72 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col md:flex-row lg:flex-col items-center justify-between gap-x-4 gap-y-6 py-8 lg:py-0">
            {chartsData.map((chart, idx) => (
                <PieChartComponent
                    key={idx}
                    title={chart.title}
                    breakdown={chart.breakdown}
                    labelKey={chart.labelKey}
                    dataKey={chart.dataKey}
                />
            ))}
        </div>
    );
}