import React from "react";
import { Activity, Scale, Timer, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GA4StatisticsProps {
    totalSessions?: number;
    engagementRate?: number;
    averageDuration?: string;
    newVisitors?: number;
    isLoading?: boolean;
    error?: string | null;
}

export default function GA4Statistics({
    totalSessions,
    engagementRate,
    averageDuration,
    newVisitors,
    isLoading = false,
    error = null,
}: GA4StatisticsProps) {
    const [showData, setShowData] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setShowData(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (error) {
        return (
            <div className="w-full text-center text-red-600 border rounded-xl">
                Error: {error}
            </div>
        );
    }

    // Show skeleton if still loading, if delay not complete, or if any required stat is undefined.
    if (
        isLoading ||
        !showData ||
        totalSessions === undefined ||
        engagementRate === undefined ||
        averageDuration === undefined ||
        newVisitors === undefined
    ) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <Card
                        key={idx}
                        className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm animate-pulse"
                    >
                        <CardContent className="w-full flex items-center p-3 gap-3">
                            <div className="p-2 rounded-lg bg-gray-300 dark:bg-gray-600 h-10 w-10" />
                            <div className="ml-4 flex-1 gap-y-4">
                                <div className="h-5 my-1 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // Data is loaded and delay is complete, render statistics.
    const stats = [
        {
            title: "Total Sessions",
            value: totalSessions,
            format: (val: number) => val,
            icon: Activity,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            title: "Engagement Rate",
            value: engagementRate,
            format: (val: number) => val.toFixed(2),
            icon: Scale,
            iconBg: "bg-orange-100",
            iconColor: "text-orange-600",
        },
        {
            title: "Average Duration",
            value: averageDuration,
            format: (val: string) => val,
            icon: Timer,
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600",
        },
        {
            title: "New Visitors",
            value: newVisitors,
            format: (val: number) => val,
            icon: UserPlus,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
            {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={idx}
                        className="border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
                    >
                        <CardContent className="w-full flex items-center p-3 gap-3">
                            <div className="w-1/4 flex items-center justify-center">
                                <div className={`p-2 rounded-md ${stat.iconBg}`}>
                                    <Icon className={`${stat.iconColor} w-6 h-6`} />
                                </div>
                            </div>
                            <div className="w-3/4 flex flex-col">
                                <span className="text-[13px] text-gray-600 dark:text-gray-300">
                                    {stat.title}
                                </span>
                                <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                    {stat.format(stat.value as never)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}