import React from 'react'
import type { Metadata } from "next"
import { buildTitle } from '@/utils/functions'
import HempCertificateOfAnalysisClient from '@/components/siteadmin/Pages/HempCertificateOfAnalysisClient'

export const metadata: Metadata = {
    title: buildTitle("Hemp Certificate of Analysis"),
    description: "View and manage hemp product certificates of analysis (COA) for compliance and quality assurance.",
}


export default function HempCertificateOfAnalysisPage() {
    return (
        <HempCertificateOfAnalysisClient />
    )
}
