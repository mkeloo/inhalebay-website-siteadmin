import React from 'react'
import type { Metadata } from "next"
import HempLabelMakerClient from '@/components/siteadmin/Pages/HempLabelMakerClient'
import { buildTitle } from '@/utils/functions'

export const metadata: Metadata = {
    title: buildTitle("Hemp Label Maker"),
    description: "Create custom hemp product labels with QR codes and lab certificate data.",
}


export default function HempLabelMakerPage() {
    return (
        <HempLabelMakerClient />
    )
}
