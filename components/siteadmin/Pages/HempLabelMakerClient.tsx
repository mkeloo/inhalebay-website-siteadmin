// app/siteadmin/LabelMaker/HempLabelMaker.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toPng } from "html-to-image";
import inhalebaylogo from "@/assets/InhaleBayLogoInvert.webp";
import {
    fetchAllHempLabCertificates,
    fetchCertificatesURL,
    HempLabCertificates,
} from "@/app/actions/hempLabCOA";
import { IndividualLabelPreview } from "@/components/siteadmin/LabelMaker/individualLabelPreview";
import { VerticalLabelPreview } from "../LabelMaker/VerticalLabelPreview";

const BACKUP_GOOGLE_DOC_URL =
    "https://docs.google.com/document/d/19UBrebsqHlbk18JM5jtZZcJCZLVf6m-ZOR-z42GWTrU/edit?usp=sharing";

export default function HempLabelMaker() {
    const [labCertificates, setLabCertificates] = useState<HempLabCertificates[]>([]);
    const [certificatesURL, setCertificatesURL] = useState<string>("");
    const [productWeight, setProductWeight] = useState("1 g");
    const [selectedProductUrl, setSelectedProductUrl] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [qrValue, setQrValue] = useState("");
    const [docUrl, setDocUrl] = useState(BACKUP_GOOGLE_DOC_URL);
    const [searchTerm, setSearchTerm] = useState("");
    // new state for rotation toggle
    const [verticalRotated, setVerticalRotated] = useState(false);

    const labelRef = useRef<HTMLDivElement>(null);
    const secondLabelRef = useRef<HTMLDivElement>(null);

    const LABEL_WIDTH = 4;
    const LABEL_HEIGHT = 1;

    useEffect(() => {
        (async () => {
            const [certRes, url] = await Promise.all([
                fetchAllHempLabCertificates(),
                fetchCertificatesURL(),
            ]);

            if (certRes.success) setLabCertificates(certRes.data);
            setCertificatesURL(url);
        })();
    }, []);

    function handleProductSelection(fileUrl: string, name: string) {
        setSelectedProductUrl(fileUrl);
        setSelectedProduct(name);
        // build full URL for QR
        setQrValue(`${certificatesURL}${fileUrl}`);
    }

    async function downloadLabel() {
        if (!labelRef.current) return;
        const dataUrl = await toPng(labelRef.current, { pixelRatio: 4 });
        const link = document.createElement("a");
        link.download =
            `${selectedProduct?.replace(/\s+/g, "-").toLowerCase() || "second-label"}.png`;
        link.href = dataUrl;
        link.click();
    }

    async function downloadSecondLabel() {
        if (!secondLabelRef.current) return;
        const dataUrl = await toPng(secondLabelRef.current, { pixelRatio: 4 });
        const link = document.createElement("a");
        link.download =
            `${selectedProduct?.replace(/\s+/g, "-").toLowerCase()}-second-label.png`;
        link.href = dataUrl;
        link.click();
    }

    return (
        <div className="w-full space-y-8 max-w-screen-xl p-4 flex flex-col lg:flex-row items-start justify-center lg:justify-between gap-6">
            {/* Controls */}
            <Card className="w-full lg:w-[60%] p-4 space-y-6">
                <h2 className="text-3xl font-semibold text-center">Hemp Label Maker</h2>

                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <Label>Label Width</Label>
                            <input
                                type="text"
                                value={`${LABEL_WIDTH}"`}
                                disabled
                                className="mt-1 w-full rounded border px-2 py-1"
                            />
                        </div>
                        <div>
                            <Label>Label Height</Label>
                            <input
                                type="text"
                                value={`${LABEL_HEIGHT}"`}
                                disabled
                                className="mt-1 w-full rounded border px-2 py-1"
                            />
                        </div>
                        <div>
                            <Label>Weight</Label>
                            <Select value={productWeight} onValueChange={setProductWeight}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select weight" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1 g">1 g</SelectItem>
                                    <SelectItem value="4 g">4 g</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Google Doc URL input */}
                    <div className="mt-4">
                        <Label>Google Doc Template URL</Label>
                        <input
                            type="url"
                            placeholder="Paste your Google Doc link here"
                            value={docUrl}
                            onChange={(e) => setDocUrl(e.currentTarget.value)}
                            className="mt-1 w-full rounded border px-2 py-1"
                        />
                    </div>


                    {/* PRODUCT SELECTION FROM VERTICAL LIST */}
                    <Card className="w-full h-[364px] p-2 md:p-4 flex flex-col">
                        {/* title + search */}
                        <div className="w-full flex flex-col lg:flex-row items-center justify-between mb-2 px-2 gap-4">
                            <h3 className="text-xl font-bold">Select a Product</h3>

                            {/* search input */}
                            <Input
                                type="text"
                                placeholder="Search…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                                className="w-full lg:w-1/3 rounded border px-2 py-1 text-sm"
                            />

                        </div>

                        {/* filtered list */}
                        <div className="flex-1 overflow-y-auto dark:bg-slate-800 bg-neutral-300 rounded-lg p-4">
                            <RadioGroup
                                value={selectedProductUrl}
                                onValueChange={(fileUrl) => {
                                    const cert = labCertificates.find((c) => c.file_url === fileUrl);
                                    if (cert) handleProductSelection(fileUrl, cert.name);
                                }}
                                className="space-y-1"
                            >
                                {labCertificates
                                    .filter((cert) =>
                                        cert.name.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((cert) => (
                                        <div key={cert.id} className="flex items-center gap-2">
                                            <RadioGroupItem value={cert.file_url} id={`product-${cert.id}`} />
                                            <Label htmlFor={`product-${cert.id}`} className="cursor-pointer pt-1.5">
                                                {cert.name}
                                            </Label>
                                        </div>
                                    ))}
                            </RadioGroup>
                        </div>
                    </Card>
                </div>


            </Card>

            {/* Single-Label Preview */}
            <Card className="w-full lg:w-[40%] space-y-4 text-center p-4">
                <h2 className="text-3xl font-semibold text-center">Label Preview</h2>
                <div className="w-full flex flex-col items-center justify-center p-6 border rounded-lg bg-gray-400 shadow-md  ">
                    <div ref={labelRef} className="inline-block">
                        <IndividualLabelPreview
                            id="preview-label"
                            productName={selectedProduct || "Product Name THCA Flower"}
                            weight={productWeight}
                            qrValue={qrValue}
                            logoSrc={inhalebaylogo.src}
                        />
                    </div>
                </div>
                {/* Vertical Preview with Rotate Toggle */}
                <div className="w-full flex flex-col items-center justify-center p-6 border rounded-lg bg-gray-400 shadow-md">
                    <Button className="bg-blue-800 text-white hover:bg-sky-500" onClick={() => setVerticalRotated(r => !r)}>
                        {verticalRotated ? 'Vertical' : 'Horizontal'}
                    </Button>
                    <div
                        ref={secondLabelRef}
                        className={`inline-block transform transition-transform duration-300 mt-4 ${verticalRotated ? '-rotate-90' : 'rotate-0'
                            }`}
                    >
                        <VerticalLabelPreview
                            id="preview-label"
                            productName={selectedProduct || "Product Name THCA Flower"}
                            weight={productWeight}
                            batchNumber={labCertificates.find(cert => cert.file_url === selectedProductUrl)?.batch_number}
                            thcaMgPerGram={labCertificates.find(cert => cert.file_url === selectedProductUrl)?.thca_mg_per_gram}
                            qrValue={qrValue}
                            logoSrc={inhalebaylogo.src}
                        />
                    </div>
                </div>
                <div className="flex flex-col justify-center gap-4">
                    <Button onClick={downloadLabel} disabled={!selectedProductUrl}>
                        Download Label Image
                    </Button>
                    <Button onClick={downloadSecondLabel} disabled={!selectedProductUrl}>
                        Download Second Label Image
                    </Button>
                    <a
                        href={docUrl || BACKUP_GOOGLE_DOC_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block"
                    >
                        <Button variant="secondary" disabled={!docUrl}>
                            Open Google Doc Template
                        </Button>
                    </a>
                </div>
            </Card>
        </div>
    );
}