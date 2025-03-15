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
    // Await the dynamic parameters before using them
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
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate: `${parsedDays}daysAgo`, endDate: 'today' }],
            metrics: [
                { name: 'sessions' },
                { name: 'engagementRate' },
                { name: 'newUsers' },
                { name: 'averageSessionDuration' },
                { name: 'screenPageViews' },
                { name: 'activeUsers' }
            ],
            dimensions: [
                { name: 'sessionDefaultChannelGrouping' },
                { name: 'browser' },
                { name: 'deviceCategory' },
                { name: 'pageTitle' }, // Fetch page title
                { name: 'pagePath' },
                { name: 'date' }
            ]
        });

        const formattedData = formatAnalyticsData(response, parsedDays);
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
 * Formats the GA4 API response into the desired JSON structure.
 */
function formatAnalyticsData(response: any, days: number): AnalyticsResponse {
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

    response.rows.forEach((row: any) => {
        const dimensions = row.dimensionValues.map((d: any) => d.value);
        const metrics = row.metricValues.map((m: any) => parseFloat(m.value));

        const [channel, browser, device, pageTitle, pagePath, date] = dimensions;
        const [sessions, engagementRate, newUsers, avgSessionDuration, pageViews, activeUsers] = metrics;

        // Total Metrics
        if (channel === "Direct" || channel === "Organic Search" || channel === "Referral") {
            data.total_sessions += sessions;
            data.total_engagement_rate += engagementRate;
            data.total_new_users += newUsers;
            data.average_duration += avgSessionDuration;
        }

        // Format the breakdowns
        if (channel) {
            data.sessions[channel] = (data.sessions[channel] || 0) + sessions;
            data.engagement_rates[channel] = engagementRate * 100;
            data.durations[channel] = avgSessionDuration;
            data.durations_formatted[channel] = formatDuration(avgSessionDuration);
        }

        if (date) {
            data.historic_data_formatted[date] = {
                page_views: pageViews,
                active_users: activeUsers,
            };
        }

        if (browser) {
            let existingBrowser = data.browser_breakdown.find((b) => b.browser === browser);
            if (existingBrowser) {
                existingBrowser.views += pageViews;
            } else {
                data.browser_breakdown.push({ browser, views: pageViews });
            }
        }

        if (device) {
            let existingDevice = data.device_breakdown.find((d) => d.device === device);
            if (existingDevice) {
                existingDevice.views += pageViews;
            } else {
                data.device_breakdown.push({ device, views: pageViews });
            }
        }

        if (pagePath) {
            let existingPage = data.page_view_breakdown.find((p) => p.path === pagePath);
            if (existingPage) {
                existingPage.views += pageViews;
            } else {
                data.page_view_breakdown.push({ title: pageTitle, path: pagePath, views: pageViews });
            }
        }
    });

    // Format the total metrics
    data.total_sessions_formatted = data.total_sessions.toLocaleString();
    data.total_new_users_formatted = data.total_new_users.toLocaleString();
    data.average_duration_formatted = formatDuration(data.average_duration);

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
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}