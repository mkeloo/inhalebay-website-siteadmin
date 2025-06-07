import React from 'react'
import type { Metadata } from "next"
import { buildTitle } from '@/utils/functions'
import HempFlowerDealsClient from '@/components/siteadmin/Pages/HempFlowerDealsClient'

export const metadata: Metadata = {
    title: buildTitle("Hemp Flower Deals"),
    description: "Add and manage hemp flower deals for your store. Showcase special offers, discounts, and promotions to attract customers.",
}


export default function HempFlowerDealsPage() {
    return (
        <HempFlowerDealsClient />
    )
}
