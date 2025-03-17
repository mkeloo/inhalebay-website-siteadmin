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

    const correctedPath = imagePath.replace(/^\/+/, ""); // remove any leading slashes
    const { error: storageError } = await supabase.storage
        .from("inhale-bay-website")
        .remove([correctedPath]);
    if (storageError) throw storageError;

    console.log("imagePath", imagePath);

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

// In websiteStoreImages.ts
export async function uploadStoreImagesBulk(formData: FormData): Promise<void> {
    const supabase = await createClient();
    const rawFiles = formData.getAll("files") as File[];

    if (!rawFiles.length) {
        throw new Error("No files provided for bulk upload.");
    }

    // Fetch current max sort value
    const { data: currentImages, error: fetchError } = await supabase
        .from("website_store_images")
        .select("sort")
        .order("sort", { ascending: false })
        .limit(1);
    if (fetchError) throw fetchError;

    let baseSort = 0;
    if (currentImages && currentImages.length > 0) {
        baseSort = currentImages[0].sort;
    }

    // For each file, also read the matching alt text
    for (let i = 0; i < rawFiles.length; i++) {
        const file = rawFiles[i];
        // console.log("Uploading file:", file.name, file.size);

        try {
            const altKey = `alt-${i}`;
            const altText = (formData.get(altKey) as string) || file.name;
            const baseTimestamp = Date.now();
            const filePath = `store-gallery-images/${baseTimestamp}-${i}-${file.name}`;

            const { error: uploadError } = await supabase.storage
                .from("inhale-bay-website")
                .upload(filePath, file);

            if (uploadError) {
                console.error("Upload failed for file:", file.name, uploadError);
                throw uploadError;
            }

            const { error: insertError } = await supabase
                .from("website_store_images")
                .insert([
                    {
                        image_src: `/${filePath}`,
                        image_alt: altText,
                        sort: baseSort + i + 1,
                    },
                ]);

            if (insertError) {
                console.error("DB insert failed for file:", file.name, insertError);
                throw insertError;
            }

            // console.log("File uploaded + inserted successfully:", file.name);
        } catch (err) {
            console.error("Bulk upload error for file:", file.name, err);
            throw err;
        }
    }

}