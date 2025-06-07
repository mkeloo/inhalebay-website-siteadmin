// app/dashboard/store-content/gallery/page.tsx
import { getStoreImages, } from "@/app/actions/websiteStoreImages";
import StoreGalleryClient from "./StoreGalleryClient";
import type { Metadata } from "next"
import { buildTitle } from '@/utils/functions'

export const metadata: Metadata = {
    title: buildTitle("Store Gallery"),
    description: "Manage your store's image gallery. Upload, edit, and organize images to showcase your products and brand.",
}


export default async function StoreGalleryPage() {
    // 1. Fetch data on the server
    const [images] = await Promise.all([
        getStoreImages(),
    ]);

    // 2. Pass data to a client component for rendering
    return (
        <StoreGalleryClient images={images} />
    );
}