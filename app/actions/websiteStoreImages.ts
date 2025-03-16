// app/actions/websiteStoreImages.ts
"use server";

import { createClient } from "@/utils/supabase/server";

type ImageRecord = {
    id: number;
    image_src: string;
    image_alt: string;
    sort: number;
    created_at?: string;
    updated_at?: string;
};

// Fetch images (Read)
export async function getStoreImages(): Promise<ImageRecord[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("website_store_images")
        .select("*")
        .order("sort", { ascending: true });

    if (error) throw error;
    return data || [];
}

// Update image details (alt, sort, optionally new file)
export async function updateStoreImage(
    id: number,
    imageAlt?: string,
    sortOrder?: number,
    newFile?: File | null
) {
    const supabase = await createClient();
    const updateData: Record<string, any> = {};

    if (newFile) {
        const filePath = `/store-gallery-images/${Date.now()}-${newFile.name}`;
        const { error: uploadErr } = await supabase.storage
            .from("inhale-bay-website")
            .upload(filePath, newFile);
        if (uploadErr) throw uploadErr;

        updateData.image_src = filePath;
    }

    if (imageAlt !== undefined) updateData.image_alt = imageAlt;
    if (sortOrder !== undefined) updateData.sort = sortOrder;

    const { error: updateErr } = await supabase
        .from("website_store_images")
        .update(updateData)
        .eq("id", id);

    if (updateErr) throw updateErr;

    return "Image updated successfully!";
}

// Delete image from table and storage
export async function deleteStoreImage(id: number, imagePath: string) {
    const supabase = await createClient();

    const { error: storageError } = await supabase.storage
        .from("inhale-bay-website")
        .remove([imagePath]);
    if (storageError) throw storageError;

    const { error: deleteError } = await supabase
        .from("website_store_images")
        .delete()
        .eq("id", id);
    if (deleteError) throw deleteError;

    return "Image deleted successfully!";
}

// Update sort order after drag-and-drop
export async function updateSortOrder(items: Array<{ id: number; sort: number }>) {
    const supabase = await createClient();
    const promises = items.map(item =>
        supabase.from("website_store_images").update({ sort: item.sort }).eq("id", item.id)
    );
    await Promise.all(promises);
}