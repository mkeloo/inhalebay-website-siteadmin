import React from 'react'
import type { Metadata } from "next"
import { buildTitle } from '@/utils/functions'
import StoreReviewsClient from '@/components/siteadmin/Pages/StoreReviewsClient'

export const metadata: Metadata = {
    title: buildTitle("Store Reviews"),
    description: "Manage and respond to customer reviews for your store. Engage with your customers and improve your store's reputation.",
}


export default function StoreReviewsPage() {
    return (
        <StoreReviewsClient />
    )
}
