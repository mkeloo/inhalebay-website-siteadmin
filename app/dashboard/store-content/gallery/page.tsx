// app/dashboard/store-content/gallery/page.tsx
import { getStoreImages, } from "@/app/actions/websiteStoreImages";
import StoreGalleryClient from "./StoreGalleryClient";

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