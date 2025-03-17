"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Shape of the 'store_reviews' table row
 * Make sure the field names/types match your DB schema exactly.
 */
export type StoreReview = {
    id: number;
    name: string;
    body: string;
    stars: number;
    link?: string;
    created_at?: string;
    updated_at?: string;
    option_name?: string; // if you use that field
};

/**
 * Fetch all store reviews, ordered by ID descending (change as needed).
 */
export async function fetchStoreReviews(
    page: number,
    pageSize: number
): Promise<{ success: boolean; data: StoreReview[]; error?: string }> {
    try {
        const supabase = await createClient();
        const start = (page - 1) * pageSize;
        const end = page * pageSize - 1;
        const { data, error } = await supabase
            .from("store_reviews")
            .select("*")
            .order("id", { ascending: false })
            .range(start, end);

        if (error) throw error;
        return { success: true, data: data as StoreReview[] };
    } catch (err: any) {
        return { success: false, data: [], error: err.message };
    }
}

/**
 * Fetch a single review by ID.
 */
export async function fetchStoreReviewById(
    id: number
): Promise<{
    success: boolean;
    data?: StoreReview;
    error?: string;
}> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("store_reviews")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return { success: true, data: data as StoreReview };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Create a new review. 
 * Omit fields like 'id', 'created_at', etc., because the DB sets them automatically.
 */
export async function createStoreReview(
    payload: Omit<StoreReview, "id" | "created_at" | "updated_at">
): Promise<{
    success: boolean;
    data?: StoreReview;
    error?: string;
}> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("store_reviews")
            .insert([payload])
            .select("*")
            .single();

        if (error) throw error;
        return { success: true, data: data as StoreReview };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Update an existing review by ID. 
 * The 'payload' can include partial fields: name, body, stars, link, etc.
 */
export async function updateStoreReview(
    id: number,
    payload: Partial<StoreReview>
): Promise<{
    success: boolean;
    data?: StoreReview;
    error?: string;
}> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("store_reviews")
            .update(payload)
            .eq("id", id)
            .select("*")
            .single();

        if (error) throw error;
        return { success: true, data: data as StoreReview };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Delete a review by ID.
 */
export async function deleteStoreReview(
    id: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from("store_reviews")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}