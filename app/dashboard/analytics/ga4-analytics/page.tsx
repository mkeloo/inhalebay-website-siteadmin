import React from 'react'
import type { Metadata } from "next"
import { buildTitle } from '@/utils/functions'
import CMSDashboardClient from '@/components/siteadmin/Pages/CMSDashboardClient'

export const metadata: Metadata = {
    title: buildTitle("Website Analytics"),
    description: "View and manage your website analytics, including traffic sources, user behavior, and performance metrics. Gain insights to optimize your content and improve user engagement.",
}


export default function CMSDashboardPage() {
    return (
        <CMSDashboardClient />
    )
}
