"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * The shape of your vape deals table row.
 */
export type VapeDeal = {
    id: number;
    vape_company: string;
    buy_1_price: number;
    buy_2_price: number;
    discount_percent: number;
    deal_tagline: string;
    short_title: string;
    image_src: string;
    bg_gradient: string;
    created_at?: string;
    updated_at?: string;
    option_name?: string;
};

/* ---------------------------------------------
   1) Fetch the media bucket URL (option_value) 
      from the inhale_bay_website_settings table 
      where option_name = 'media_bucket_url'.
---------------------------------------------- */
export async function fetchMediaBucketUrl(): Promise<string> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("inhale_bay_website_settings")
        .select("option_value")
        .eq("option_name", "media_bucket_url")
        .single();

    if (error) throw error;
    if (!data) throw new Error("No media_bucket_url found in settings.");
    return data.option_value as string;
}

/* ---------------------------------------------
   2) Basic fetch calls (no pagination shown):
---------------------------------------------- */
export async function fetchVapeDeals(): Promise<{
    success: boolean;
    data: VapeDeal[];
    error?: string;
}> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("website_vape_deals")
            .select("*")
            .order("id", { ascending: false });
        if (error) throw error;
        return { success: true, data: data as VapeDeal[] };
    } catch (err: any) {
        return { success: false, data: [], error: err.message };
    }
}

export async function fetchVapeDealById(id: number): Promise<{
    success: boolean;
    data?: VapeDeal;
    error?: string;
}> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("website_vape_deals")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        return { success: true, data: data as VapeDeal };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/* ---------------------------------------------
   3) Basic create/update that expect direct 
      payload (no file upload).
---------------------------------------------- */
export async function createVapeDeal(
    payload: Omit<VapeDeal, "id" | "created_at" | "updated_at">
): Promise<{ success: boolean; data?: VapeDeal; error?: string }> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("website_vape_deals")
            .insert([payload])
            .select("*")
            .single();
        if (error) throw error;
        return { success: true, data: data as VapeDeal };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function updateVapeDeal(
    id: number,
    payload: Partial<VapeDeal>
): Promise<{ success: boolean; data?: VapeDeal; error?: string }> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("website_vape_deals")
            .update(payload)
            .eq("id", id)
            .select("*")
            .single();
        if (error) throw error;
        return { success: true, data: data as VapeDeal };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function updateVapeDealEnabled(
    id: number,
    isEnabled: boolean
): Promise<{ success: boolean; data?: VapeDeal; error?: string }> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("website_vape_deals")
            .update({ is_enabled: isEnabled })
            .eq("id", id)
            .select("*")
            .single();

        if (error) throw error;
        return { success: true, data: data as VapeDeal };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}


/* ---------------------------------------------
   4) Delete a deal by ID
---------------------------------------------- */
export async function deleteVapeDeal(
    id: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from("website_vape_deals")
            .delete()
            .eq("id", id);
        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/* ---------------------------------------------
   5) Create a deal with an uploaded file 
      using FormData. 
      - Expects fields like 'vape_company', 
        'buy_1_price', 'buy_2_price', etc.
      - Also expects a file under name="file".
---------------------------------------------- */
export async function createVapeDealWithFile(
    formData: FormData
): Promise<{ success: boolean; data?: VapeDeal; error?: string }> {
    try {
        const supabase = await createClient();

        // 1) Extract textual fields from FormData
        const vape_company = formData.get("vape_company") as string;
        const buy_1_price = parseFloat(formData.get("buy_1_price") as string);
        const buy_2_price = parseFloat(formData.get("buy_2_price") as string);
        const discount_percent = parseFloat(formData.get("discount_percent") as string);
        const deal_tagline = formData.get("deal_tagline") as string;
        const short_title = formData.get("short_title") as string;
        const bg_gradient = formData.get("bg_gradient") as string;

        // 2) Attempt to get the file
        const file = formData.get("file") as File | null;

        // 3) Upload the file if present
        let image_src = "";
        if (file) {
            // fetch the base media bucket URL
            const baseUrl = await fetchMediaBucketUrl();
            // define the path in your supabase storage
            const filePath = `vapes-deals/${Date.now()}-${file.name}`;

            // Upload to supabase
            const { error: uploadError } = await supabase.storage
                .from("inhale-bay-website")
                .upload(filePath, file);
            if (uploadError) throw uploadError;

            // store only the relative path (or slash + path) in DB
            image_src = `/${filePath}`;
        }

        // 4) Insert into DB
        const { data: insertData, error: insertError } = await supabase
            .from("website_vape_deals")
            .insert([
                {
                    vape_company,
                    buy_1_price,
                    buy_2_price,
                    discount_percent,
                    deal_tagline,
                    short_title,
                    image_src,
                    bg_gradient,
                },
            ])
            .select("*")
            .single();

        if (insertError) throw insertError;
        return { success: true, data: insertData as VapeDeal };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/* ---------------------------------------------
   6) Update a deal with optional new file 
      using FormData. 
      - Expects fields plus optional file
---------------------------------------------- */
export async function updateVapeDealWithFile(
    id: number,
    formData: FormData
): Promise<{ success: boolean; data?: VapeDeal; error?: string }> {
    try {
        const supabase = await createClient();

        // parse fields
        const vape_company = formData.get("vape_company") as string;
        const buy_1_price = formData.get("buy_1_price");
        const buy_2_price = formData.get("buy_2_price");
        const discount_percent = formData.get("discount_percent");
        const deal_tagline = formData.get("deal_tagline") as string;
        const short_title = formData.get("short_title") as string;
        const bg_gradient = formData.get("bg_gradient") as string;

        // optional file
        const file = formData.get("file") as File | null;

        // Build payload
        const updatePayload: Partial<VapeDeal> = {};

        if (vape_company !== undefined) updatePayload.vape_company = vape_company;
        if (buy_1_price !== null) updatePayload.buy_1_price = parseFloat(buy_1_price as string);
        if (buy_2_price !== null) updatePayload.buy_2_price = parseFloat(buy_2_price as string);
        if (discount_percent !== null) updatePayload.discount_percent = parseFloat(discount_percent as string);
        if (deal_tagline !== undefined) updatePayload.deal_tagline = deal_tagline;
        if (short_title !== undefined) updatePayload.short_title = short_title;
        if (bg_gradient !== undefined) updatePayload.bg_gradient = bg_gradient;

        // If new file, upload and store new path
        if (file) {
            const filePath = `vapes-deals/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from("inhale-bay-website")
                .upload(filePath, file);
            if (uploadError) throw uploadError;

            updatePayload.image_src = `/${filePath}`;
        }

        // Now do the DB update
        const { data: updatedData, error: updateError } = await supabase
            .from("website_vape_deals")
            .update(updatePayload)
            .eq("id", id)
            .select("*")
            .single();

        if (updateError) throw updateError;
        return { success: true, data: updatedData as VapeDeal };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}