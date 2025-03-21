"use server";

import { createClient } from "@/utils/supabase/server";

export type FlowerBudDeal = {
    id: number;
    bud_name: string;
    one_gram_price: number;
    four_gram_price: number;
    image_src: string;
    bg_gradient: string;
    created_at?: string;
    updated_at?: string;
    option_name?: string;
    sort?: number;
    is_enabled?: boolean;
};

/* -----------------------------
   Update sort order after drag-and-drop
------------------------------ */
export async function updateSortOrder(items: Array<{ id: number; sort: number }>) {
    const supabase = await createClient();
    const promises = items.map(item =>
        supabase
            .from("website_flower_buds_deals")
            .update({ sort: item.sort })
            .eq("id", item.id)
    );

    const results = await Promise.allSettled(promises);
    results.forEach((result, index) => {
        if (result.status === "rejected") {
            console.error(`Failed to update sort for id ${items[index].id}:`, result.reason);
        } else {
            const { error } = result.value;
            if (error) {
                console.error(`Failed to update sort for id ${items[index].id}:`, error);
            }
        }
    });
}



/* -----------------------------
   Fetch the media bucket URL
------------------------------ */
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

/* -----------------------------
   Fetch all flower buds deals
------------------------------ */
export async function fetchFlowerBudDeals(): Promise<{
    success: boolean;
    data: FlowerBudDeal[];
    error?: string;
}> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("website_flower_buds_deals")
            .select("*")
            .order("sort", { ascending: true });
        if (error) throw error;
        return { success: true, data: data as FlowerBudDeal[] };
    } catch (err: any) {
        return { success: false, data: [], error: err.message };
    }
}

/* -----------------------------
   Fetch a single deal by ID
------------------------------ */
export async function fetchFlowerBudDealById(id: number): Promise<{
    success: boolean;
    data?: FlowerBudDeal;
    error?: string;
}> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("website_flower_buds_deals")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        return { success: true, data: data as FlowerBudDeal };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/* -----------------------------
   Create a new deal with file upload
------------------------------ */
export async function createFlowerBudDealWithFile(
    formData: FormData
): Promise<{ success: boolean; data?: FlowerBudDeal; error?: string }> {
    try {
        const supabase = await createClient();

        // Extract fields
        const bud_name = formData.get("bud_name") as string;
        const one_gram_price = parseFloat(formData.get("one_gram_price") as string);
        const four_gram_price = parseFloat(formData.get("four_gram_price") as string);
        const bg_gradient = formData.get("bg_gradient") as string;

        // Optional file
        const file = formData.get("file") as File | null;
        let image_src = "";
        if (file) {
            const filePath = `flower-buds-deals/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from("inhale-bay-website")
                .upload(filePath, file);
            if (uploadError) throw uploadError;
            image_src = `/${filePath}`;
        }

        const { data: insertData, error: insertError } = await supabase
            .from("website_flower_buds_deals")
            .insert([
                {
                    bud_name,
                    one_gram_price,
                    four_gram_price,
                    image_src,
                    bg_gradient,
                },
            ])
            .select("*")
            .single();

        if (insertError) throw insertError;
        return { success: true, data: insertData as FlowerBudDeal };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function updateFlowerBudDealEnabled(
    id: number,
    isEnabled: boolean
): Promise<{ success: boolean; data?: FlowerBudDeal; error?: string }> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("website_flower_buds_deals")
            .update({ is_enabled: isEnabled })
            .eq("id", id)
            .select("*")
            .single();

        if (error) throw error;
        return { success: true, data: data as FlowerBudDeal };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}


/* -----------------------------
   Update an existing deal with optional file replacement
------------------------------ */
export async function updateFlowerBudDealWithFile(
    id: number,
    formData: FormData
): Promise<{ success: boolean; data?: FlowerBudDeal; error?: string }> {
    try {
        const supabase = await createClient();

        // Parse fields
        const bud_name = formData.get("bud_name") as string;
        const one_gram_price = formData.get("one_gram_price");
        const four_gram_price = formData.get("four_gram_price");
        const bg_gradient = formData.get("bg_gradient") as string;

        const file = formData.get("file") as File | null;
        const updatePayload: Partial<FlowerBudDeal> = {};
        if (bud_name !== undefined) updatePayload.bud_name = bud_name;
        if (one_gram_price !== null) updatePayload.one_gram_price = parseFloat(one_gram_price as string);
        if (four_gram_price !== null) updatePayload.four_gram_price = parseFloat(four_gram_price as string);
        if (bg_gradient !== undefined) updatePayload.bg_gradient = bg_gradient;

        if (file) {
            const filePath = `flower-buds-deals/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from("inhale-bay-website")
                .upload(filePath, file);
            if (uploadError) throw uploadError;
            updatePayload.image_src = `/${filePath}`;
        }

        const { data: updatedData, error: updateError } = await supabase
            .from("website_flower_buds_deals")
            .update(updatePayload)
            .eq("id", id)
            .select("*")
            .single();

        if (updateError) throw updateError;
        return { success: true, data: updatedData as FlowerBudDeal };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/* -----------------------------
   Delete a deal by ID
------------------------------ */
export async function deleteFlowerBudDeal(
    id: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from("website_flower_buds_deals")
            .delete()
            .eq("id", id);
        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}