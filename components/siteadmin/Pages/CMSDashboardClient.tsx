"use client";
import React from "react";
import GA4Statistics from "@/components/siteadmin/GA4/GA4-Statistics";
import GA4PieCharts from "@/components/siteadmin/GA4/GA4-PieCharts";
import GA4PageActivityLineChart from "@/components/siteadmin/GA4/GA4-PageActivityLineChart";
import GA4PageViewBreakdown from "@/components/siteadmin/GA4/GA4-PageViewBreakdown";
import { Unplug, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Date Selection Options
const dateSelection = [
    { name: "Yesterday", value: 1 },
    { name: "7 Days", value: 7 },
    { name: "14 Days", value: 14 },
    { name: "30 Days", value: 30 },
    { name: "60 Days", value: 60 },
    { name: "90 Days", value: 90 },
    { name: "365 Days", value: 365 },
];

export default function CMSDashboardClient() {
    const [gaData, setGaData] = React.useState<any>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [days, setDays] = React.useState<number>(30); // Default to 30 Days
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    React.useEffect(() => {
        const fetchGAData = async () => {
            setIsLoading(true);
            try {
                // console.log(`Fetching GA4 data for the past ${days} days...`);
                const response = await fetch(`/api/analytics/${days}`);

                if (!response.ok) {
                    throw new Error("Could not parse the data feed");
                }
                const data = await response.json();
                // console.log("GA4 Data Fetched:", data);
                setGaData(data);
            } catch (err) {
                // console.error("Error fetching GA4 data:", err);
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGAData();
    }, [days]);


    if (error) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-10 gap-4">
                <Unplug size={200} className="text-gray-400 animate-pulse mb-2" />
                <div className="w-full flex items-center justify-center">
                    <p className="text-4xl text-gray-600 font-bold text-center">Google Analytics not configured.</p>
                </div>
            </div>
        );
    }

    if (!gaData) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-10 gap-4">
                <LoaderCircle size={150} className="text-gray-400 animate-spin mb-2" />
                <p className="text-4xl text-gray-600 font-bold">Loading...</p>
            </div>
        );
    }


    return (
        <main className="w-full flex flex-col items-center justify-center gap-6 p-4">
            <div className="w-full h-full flex flex-col lg:flex-row items-stretch justify-between gap-6">
                {/* Page Activity Related Stuff */}
                <div className="w-full lg:w-[70%] h-full gap-y-2">

                    {/* Date Selector Buttons */}
                    <div className="w-full flex items-center justify-center lg:justify-start mb-6">
                        <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                            {dateSelection.map((option) => (
                                <Button
                                    key={option.name}
                                    size="sm"
                                    variant={days === option.value ? "default" : "outline"}
                                    onClick={() => setDays(option.value)}
                                >
                                    {option.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* GA4 Statistics */}
                    {gaData && (
                        <GA4Statistics
                            totalSessions={gaData.total_sessions}
                            engagementRate={gaData.total_engagement_rate}
                            averageDuration={gaData.average_duration_formatted}
                            newVisitors={gaData.total_new_users}
                            isLoading={isLoading}
                        />
                    )}

                    {/* Page Activity Line Chart */}
                    <div className='w-full'>
                        {gaData && <GA4PageActivityLineChart pageActivityData={gaData.historic_data_formatted}
                            isLoading={isLoading} />}
                    </div>
                </div>

                {/* Browsers & Devices */}
                <div className="w-full lg:w-[30%] h-full">
                    {gaData && (
                        <GA4PieCharts
                            browserBreakdown={gaData.browser_breakdown}
                            deviceBreakdown={gaData.device_breakdown}
                            isLoading={isLoading}
                        />
                    )}
                </div>
            </div>

            {/*  Page View Breakdown */}
            <div className='w-full h-full'>
                {gaData && (
                    <GA4PageViewBreakdown pageViewBreakdown={gaData.page_view_breakdown} isLoading={isLoading} />
                )}
            </div>
        </main>
    );
};