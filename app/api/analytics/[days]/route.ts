import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Define Types for Structured Data
interface BrowserData {
    browser: string;
    views: number;
}

interface DeviceData {
    device: string;
    views: number;
}

interface PageViewData {
    title: string;
    path: string;
    views: number;
}

interface AnalyticsResponse {
    last_updated: string;
    days_in_range: number;
    total_sessions: number;
    total_engagement_rate: number;
    total_new_users: number;
    average_duration: number;
    total_sessions_formatted: string;
    total_new_users_formatted: string;
    average_duration_formatted: string;
    sessions: Record<string, number>;
    engagement_rates: Record<string, number>;
    durations: Record<string, number>;
    durations_formatted: Record<string, string>;
    new_users: number[];
    historic_data_formatted: Record<string, { page_views: number; active_users: number }>;
    page_view_breakdown: PageViewData[];
    browser_breakdown: BrowserData[];
    device_breakdown: DeviceData[];
}

// API Route - GET /api/analytics/[days]
export async function GET(
    request: Request,
    { params }: { params: Promise<{ days: string }> }
) {
    // Parse and validate days parameter
    const { days } = await params;
    const parsedDays = parseInt(days, 10);
    if (isNaN(parsedDays) || parsedDays <= 0) {
        return NextResponse.json(
            { error: 'Invalid days parameter. Must be a positive number.' },
            { status: 400 }
        );
    }

    const { GA4_CREDENTIALS_JSON, GA4_PROPERTY_ID } = process.env;
    if (!GA4_CREDENTIALS_JSON || !GA4_PROPERTY_ID) {
        return NextResponse.json(
            { error: 'Missing GA4 credentials or property ID in environment variables.' },
            { status: 500 }
        );
    }

    let credentials;
    try {
        credentials = JSON.parse(GA4_CREDENTIALS_JSON);
    } catch (error) {
        console.error('Error parsing GA4 credentials JSON:', error);
        return NextResponse.json(
            { error: 'Invalid GA4 credentials format.' },
            { status: 500 }
        );
    }

    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });

    try {
        // --- Query 1: Main Website Statistics (per channel) ---
        const [mainStatsResponse] = await analyticsDataClient.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate: `${parsedDays}daysAgo`, endDate: 'today' }],
            metrics: [
                { name: 'sessions' },
                { name: 'engagementRate' },
                { name: 'newUsers' }
            ],
            dimensions: [{ name: 'sessionDefaultChannelGrouping' }]
        });

        // --- Query 2: Historic Page Views (by date) ---
        const [historicResponse] = await analyticsDataClient.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate: `${parsedDays}daysAgo`, endDate: 'today' }],
            metrics: [
                { name: 'screenPageViews' },
                { name: 'activeUsers' },
                { name: 'newUsers' }
            ],
            dimensions: [{ name: 'date' }]
        });

        // --- Query 3: Page View Breakdown (by page title and path) ---
        const [pageBreakdownResponse] = await analyticsDataClient.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate: `${parsedDays}daysAgo`, endDate: 'today' }],
            metrics: [{ name: 'screenPageViews' }],
            dimensions: [
                { name: 'pageTitle' },
                { name: 'pagePath' }
            ],
            limit: 30
        });

        // --- Query 4: Browser Breakdown ---
        const [browserBreakdownResponse] = await analyticsDataClient.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate: `${parsedDays}daysAgo`, endDate: 'today' }],
            metrics: [{ name: 'screenPageViews' }],
            dimensions: [{ name: 'browser' }],
            limit: 30
        });

        // --- Query 5: Device Breakdown ---
        const [deviceBreakdownResponse] = await analyticsDataClient.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate: `${parsedDays}daysAgo`, endDate: 'today' }],
            metrics: [{ name: 'screenPageViews' }],
            dimensions: [{ name: 'deviceCategory' }],
            limit: 30
        });

        // Process all results into the final format (mirroring the Symfony logic)
        const formattedData = formatAnalyticsData(
            mainStatsResponse,
            historicResponse,
            pageBreakdownResponse,
            browserBreakdownResponse,
            deviceBreakdownResponse,
            parsedDays
        );
        return NextResponse.json(formattedData);
    } catch (error) {
        console.error('Error fetching GA4 data:', error);
        return NextResponse.json(
            { error: 'Error fetching GA4 data.' },
            { status: 500 }
        );
    }
}

/**
 * Processes and aggregates the GA4 responses to match the Symfony calculations.
 */
function formatAnalyticsData(
    mainStats: any,
    historic: any,
    pageBreakdown: any,
    browserBreakdown: any,
    deviceBreakdown: any,
    days: number
): AnalyticsResponse {
    // Initialize the overall data object
    const data: AnalyticsResponse = {
        last_updated: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
        days_in_range: days,
        total_sessions: 0,
        total_engagement_rate: 0,
        total_new_users: 0,
        average_duration: 0,
        total_sessions_formatted: "0",
        total_new_users_formatted: "0",
        average_duration_formatted: "00:00:00",
        sessions: {},
        engagement_rates: {},
        durations: {},
        durations_formatted: {},
        new_users: [],
        historic_data_formatted: {},
        page_view_breakdown: [],
        browser_breakdown: [],
        device_breakdown: [],
    };

    // --- Main Website Statistics ---
    const sessions: Record<string, number> = {};
    const engagement_rates: Record<string, number> = {};
    const durations: Record<string, number> = {};

    if (mainStats.rows) {
        mainStats.rows.forEach((row: any) => {
            const label = row.dimensionValues[0]?.value || "Unassigned";
            const sess = parseInt(row.metricValues[0]?.value || "0", 10);
            // Multiply engagementRate by 100 and round to 2 decimals
            const engRate = Math.round(parseFloat(row.metricValues[1]?.value || "0") * 100 * 100) / 100;
            const avgDur = parseInt(row.metricValues[2]?.value || "0", 10);
            sessions[label] = sess;
            engagement_rates[label] = engRate;
            durations[label] = avgDur;
        });
    }

    const totalSessions = Object.values(sessions).reduce((a, b) => a + b, 0);
    const avgEngRate = Object.keys(engagement_rates).length > 0
        ? Math.round((Object.values(engagement_rates).reduce((a, b) => a + b, 0) / Object.keys(engagement_rates).length) * 100) / 100
        : 0;
    const avgDuration = Object.keys(durations).length > 0
        ? Math.floor(Object.values(durations).reduce((a, b) => a + b, 0) / Object.keys(durations).length)
        : 0;

    data.sessions = sessions;
    data.engagement_rates = engagement_rates;
    data.durations = durations;
    data.total_sessions = totalSessions;
    data.total_engagement_rate = avgEngRate;
    data.average_duration = avgDuration;

    // --- Historic Page Views & New Users ---
    const historic_data_formatted: Record<string, { page_views: number; active_users: number }> = {};
    const newUsers: number[] = [];
    if (historic.rows) {
        historic.rows.forEach((row: any) => {
            const date = row.dimensionValues[0]?.value;
            const pageViews = parseInt(row.metricValues[0]?.value || "0", 10);
            const activeUsers = parseInt(row.metricValues[1]?.value || "0", 10);
            const newUser = parseInt(row.metricValues[2]?.value || "0", 10);
            if (date) {
                historic_data_formatted[date] = { page_views: pageViews, active_users: activeUsers };
            }
            newUsers.push(newUser);
        });
    }
    data.historic_data_formatted = historic_data_formatted;
    data.new_users = newUsers;
    const totalNewUsers = newUsers.reduce((a, b) => a + b, 0);
    data.total_new_users = totalNewUsers;

    // --- Page View Breakdown ---
    const page_view_breakdown: PageViewData[] = [];
    if (pageBreakdown.rows) {
        const sortedPages = [...pageBreakdown.rows].sort((a, b) => {
            return (
                parseInt(b.metricValues[0]?.value || "0", 10) -
                parseInt(a.metricValues[0]?.value || "0", 10)
            );
        });
        sortedPages.forEach((row: any) => {
            const title = row.dimensionValues[0]?.value || "unknown";
            const path = row.dimensionValues[1]?.value || "";
            const views = parseInt(row.metricValues[0]?.value || "0", 10);
            page_view_breakdown.push({ title, path, views });
        });
    }
    data.page_view_breakdown = page_view_breakdown;

    // --- Browser Breakdown ---
    const browser_breakdown: BrowserData[] = [];
    if (browserBreakdown.rows) {
        browserBreakdown.rows.forEach((row: any) => {
            const browser = row.dimensionValues[0]?.value || "unknown";
            const views = parseInt(row.metricValues[0]?.value || "0", 10);
            browser_breakdown.push({ browser, views });
        });
    }
    data.browser_breakdown = browser_breakdown;

    // --- Device Breakdown ---
    const device_breakdown: DeviceData[] = [];
    if (deviceBreakdown.rows) {
        deviceBreakdown.rows.forEach((row: any) => {
            const device = row.dimensionValues[0]?.value || "unknown";
            const views = parseInt(row.metricValues[0]?.value || "0", 10);
            device_breakdown.push({ device, views });
        });
    }
    data.device_breakdown = device_breakdown;

    // --- Final Totals and Formatting ---
    data.total_sessions_formatted = totalSessions.toLocaleString();
    data.total_new_users_formatted = totalNewUsers.toLocaleString();
    data.average_duration_formatted = formatDuration(avgDuration);

    // Format per‑channel durations
    const durations_formatted: Record<string, string> = {};
    for (const channel in durations) {
        durations_formatted[channel] = durations[channel]
            ? formatDuration(durations[channel])
            : "unknown";
    }
    data.durations_formatted = durations_formatted;

    return data;
}

/**
 * Converts seconds into HH:MM:SS format.
 */
function formatDuration(seconds: number): string {
    if (!seconds) return "00:00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}