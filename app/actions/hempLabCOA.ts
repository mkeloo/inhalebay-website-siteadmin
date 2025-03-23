"use server";

import { createClient } from "@/utils/supabase/server";

export type HempLabCertificates = {
    id: string; // UUID
    serial_id: number; // Auto-incrementing ID
    name: string;
    file_name: string;
    file_type: string;
    file_size_kb: number;
    file_url: string;
    created_at?: string; // Optional, as it has a default value
    updated_at?: string; // Optional, as it has a default value
    option_name?: string; // UUID, optional due to foreign key reference
};

export async function fetchAllHempLabCertificates(): Promise<{
    success: boolean;
    data: HempLabCertificates[];
    error?: string;
}> {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('hemp_lab_certificates')
            .select('*')
            .order("serial_id", { ascending: true });

        if (error) {
            console.error('Error fetching hemp lab certificates:', error);
            throw error;
        }
        return { success: true, data: data as HempLabCertificates[] };
    } catch (err: any) {
        return { success: false, data: [], error: err.message };
    }
}


export async function fetchCertificatesURL(): Promise<string> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("inhale_bay_website_settings")
        .select("option_value")
        .eq("option_name", "certificates_url")
        .single();

    if (error) throw error;
    if (!data) throw new Error("No certificates_url found in settings.");
    return data.option_value as string;
}
