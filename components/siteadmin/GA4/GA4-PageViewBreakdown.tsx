import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface PageViewItem {
    title: string;
    path: string;
    views: number;
}

interface GA4PageViewBreakdownProps {
    pageViewBreakdown: PageViewItem[];
    isLoading?: boolean;
    error?: string | null;
}

export default function GA4PageViewBreakdown({
    pageViewBreakdown,
    isLoading = false,
    error = null,
}: GA4PageViewBreakdownProps) {
    const [showData, setShowData] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowData(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (error) {
        return (
            <Card className="border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4">
                <CardContent>
                    <p className="text-center text-red-600">Error: {error}</p>
                </CardContent>
            </Card>
        );
    }

    if (isLoading || !showData || !pageViewBreakdown) {
        return (
            <Card className="border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4 animate-pulse">
                <CardHeader>
                    <CardTitle className="w-72 mx-auto text-center text-xl font-bold bg-gray-300 dark:bg-gray-600 rounded py-2 mb-4">
                        Loading...
                    </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-4 py-2 text-xl md:text-2xl">
                                    Loading...
                                </TableHead>
                                <TableHead className="px-4 py-2 text-xl md:text-2xl">
                                    Loading...
                                </TableHead>
                                <TableHead className="px-4 py-2 text-xl md:text-2xl">
                                    Loading...
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <TableRow
                                    key={idx}
                                    className={`border-b ${idx % 2 === 0
                                        ? "bg-white dark:bg-gray-800"
                                        : "bg-stone-50 dark:bg-gray-700"
                                        }`}
                                >
                                    <TableCell className="px-4 py-2 text-xl md:text-2xl">
                                        &nbsp;
                                    </TableCell>
                                    <TableCell className="px-4 py-2 text-xl md:text-2xl">
                                        &nbsp;
                                    </TableCell>
                                    <TableCell className="px-4 py-2 text-xl md:text-2xl">
                                        &nbsp;
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4">
            <CardHeader>
                <CardTitle className="pt-1 pb-4 text-center text-3xl font-bold">
                    Page View Breakdown
                </CardTitle>
            </CardHeader>
            <CardContent className="!px-0 overflow-x-scroll">
                <Table className="w-full">
                    <TableHeader className="bg-slate-200 dark:bg-gray-700">
                        <TableRow className="text-left">
                            <TableHead className="px-4 py-2 text-lg text-gray-800 dark:text-gray-200 font-bold whitespace-normal">
                                Title
                            </TableHead>
                            <TableHead className="px-4 py-2 text-lg text-gray-800 dark:text-gray-200 font-bold whitespace-normal">
                                Path
                            </TableHead>
                            <TableHead className="px-4 py-2 text-lg text-gray-800 dark:text-gray-200 font-bold whitespace-normal">
                                Views
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageViewBreakdown
                            .filter((item) => item.views >= 5)
                            .map((item, idx) => (
                                <TableRow
                                    key={idx}
                                    className={`border-b ${idx % 2 === 0
                                        ? "bg-white dark:bg-gray-800"
                                        : "bg-stone-50 dark:bg-gray-700"
                                        }`}
                                >
                                    <TableCell className="px-4 py-2 text-base">
                                        {item.title}
                                    </TableCell>
                                    <TableCell className="px-4 py-2 text-base">
                                        <a
                                            href={item.path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {item.path}
                                        </a>
                                    </TableCell>
                                    <TableCell className="px-4 py-2 text-base whitespace-normal">
                                        {item.views}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}