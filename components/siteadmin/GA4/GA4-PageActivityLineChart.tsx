import React, { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HistoricData {
    [dateString: string]: {
        page_views: number;
        active_users: number;
    };
}

interface GA4PageActivityLineChartProps {
    pageActivityData: HistoricData;
    isLoading?: boolean;
    error?: string | null;
}

export default function GA4PageActivityLineChart({
    pageActivityData,
    isLoading = false,
    error = null,
}: GA4PageActivityLineChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [showData, setShowData] = useState(false);

    // Helper to format 'YYYYMMDD' into something like 'Mar 7'
    function formatDate(dateStr: string) {
        const year = parseInt(dateStr.slice(0, 4), 10);
        const month = parseInt(dateStr.slice(4, 6), 10) - 1; // zero-based
        const day = parseInt(dateStr.slice(6, 8), 10);
        return new Date(year, month, day).toLocaleString('default', {
            month: 'short',
            day: 'numeric',
        });
    }

    // 1-second delay to show the skeleton
    useEffect(() => {
        const timer = setTimeout(() => setShowData(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Also check for the passed isLoading prop
        if (!canvasRef.current || !pageActivityData || !showData || isLoading) return;

        // Sort dates ascending
        const sortedDates = Object.keys(pageActivityData).sort((a, b) =>
            a.localeCompare(b)
        );

        // Build arrays for chart
        const labels = sortedDates.map(dateStr => formatDate(dateStr));
        const pageViews = sortedDates.map(
            dateStr => pageActivityData[dateStr].page_views
        );
        const activeUsers = sortedDates.map(
            dateStr => pageActivityData[dateStr].active_users
        );

        const chartInstance = new ChartJS(canvasRef.current, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Page Views',
                        data: pageViews,
                        borderColor: '#36A2EB',
                        backgroundColor: '#36A2EB',
                        fill: false,
                        tension: 0.1,
                    },
                    {
                        label: 'Active Users',
                        data: activeUsers,
                        borderColor: '#FF6384',
                        backgroundColor: '#FF6384',
                        fill: false,
                        tension: 0.1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 8,
                        },
                    },
                    y: {
                        beginAtZero: true,
                    },
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 25,
                            boxHeight: 5,
                        },
                    },
                },
            },
        });

        return () => {
            chartInstance.destroy();
        };
    }, [pageActivityData, showData, isLoading]);

    if (error) {
        return (
            <div className="w-full border rounded-xl p-2 text-center text-red-600">
                Error: {error}
            </div>
        );
    }


    if (isLoading || !showData || !pageActivityData) {
        return (
            <Card className="w-full h-full flex flex-col dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <CardContent className="w-full h-full flex flex-col items-center justify-center gap-4 animate-pulse p-4">
                    <div className="w-44 h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="w-full h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="w-full h-80 md:h-96 lg:h-[500px] bg-gray-300 dark:bg-gray-600 rounded"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full h-full flex flex-col dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm py-4">
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
                    Page Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-full">
                <div className="w-full h-80 md:h-96 lg:h-[540px] relative">
                    <canvas ref={canvasRef} className="w-full h-full" />
                </div>
            </CardContent>
        </Card>
    );
}