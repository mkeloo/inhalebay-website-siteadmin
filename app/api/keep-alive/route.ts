// app/api/keep-alive/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// TEST SCHEDULE: runs every minute (Vercel only supports minute-level granularity)
// Change back to "0 0 */4 * *" for production (every 4 days at midnight UTC)
export const config = {
    runtime: "edge",
    schedule: "*/1 * * * *",
};

export async function GET() {
    const supabase = await createClient();
    // fetch all rows to verify full pull
    const { data, error } = await supabase
        .from("hemp_lab_certificates")
        .select("*");
    if (error) {
        console.error("Supabase keep-alive failed:", error);
        return NextResponse.json(
            { status: "error", message: error.message },
            { status: 500 }
        );
    }

    // return count and sample row IDs
    return NextResponse.json({
        status: "pong",
        count: data?.length ?? 0,
        sample: data?.slice(0, 5).map((row) => row.id),
    });
}
