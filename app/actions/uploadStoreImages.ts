"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function uploadStoreImage(formData: FormData) {
    // Retrieve fields from the form data
    const file = formData.get("file") as File | null;
    const imageAlt = formData.get("imageAlt") as string;
    let sortOrder = formData.get("sortOrder") as string;

    if (!file) {
        throw new Error("No file provided");
    }

    // Use your existing createClient to instantiate the Supabase client
    const supabase = await createClient();

    // Get the site_url's id from inhale_bay_website_settings (this simulates using a subquery)
    const { data: settingData, error: settingError } = await supabase
        .from("inhale_bay_website_settings")
        .select("id")
        .eq("option_name", "site_url")
        .single();

    if (settingError) {
        throw settingError;
    }

    const siteUrlId = settingData.id;

    // If sortOrder is empty, automatically assign the next sort value
    if (!sortOrder || sortOrder.trim() === "") {
        const { data: sortData, error: sortError } = await supabase
            .from("website_store_images")
            .select("sort")
            .order("sort", { ascending: false })
            .limit(1);

        if (sortError) {
            throw sortError;
        }
        sortOrder = sortData && sortData.length > 0 ? String(Number(sortData[0].sort) + 1) : "1";
    }

    // Create a unique file path for storage
    const filePath = `/store-gallery-images/${Date.now()}-${file.name}`;

    // Upload the file to the bucket "inhale-bay-website"
    const { error: uploadError } = await supabase.storage
        .from("inhale-bay-website")
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    // Insert a record into website_store_images table with the retrieved site_url id
    const { error: insertError } = await supabase
        .from("website_store_images")
        .insert({
            sort: Number(sortOrder),
            image_src: filePath, // only store the relative path
            image_alt: imageAlt,
            option_name: siteUrlId,
        });

    if (insertError) {
        throw insertError;
    }

    return "Image uploaded successfully!";
}