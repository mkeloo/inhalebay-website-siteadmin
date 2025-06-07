import React from 'react'
import type { Metadata } from "next"
import { buildTitle } from '@/utils/functions'
import VapesDealsClient from '@/components/siteadmin/Pages/VapesDealsClient'

export const metadata: Metadata = {
    title: buildTitle("Vapes Deals"),
    description: "Add and manage vape deals for your store. Showcase special offers, discounts, and promotions to attract customers.",
}


export default function VapesDealsPage() {
    return (
        <VapesDealsClient />
    )
}
