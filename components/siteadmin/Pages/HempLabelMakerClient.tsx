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
import { toPng } from "html-to-image";
import { IndividualLabelPreview } from "@/components/siteadmin/LabelMaker/individualLabelPreview";
// import inhalebaylogo from "@/assets/InhaleBayLogo.svg";
import inhalebaylogo from "@/assets/InhaleBayLogoInvert.webp";
import { fetchAllHempLabCertificates, HempLabCertificates } from "@/app/actions/hempLabCOA";


const BACKUP_GOOGLE_DOC_URL = "https://docs.google.com/document/d/19UBrebsqHlbk18JM5jtZZcJCZLVf6m-ZOR-z42GWTrU/edit?usp=sharing";

const WARNINGS =
    "Warning: This product contains hemp-derived compounds. Keep out of reach of children.";


export default function HempLabelMaker() {
    const [labCertificates, setLabCertificates] = useState<HempLabCertificates[]>([]);
    const [productWeight, setProductWeight] = useState("1g");
    const [selectedProductUrl, setSelectedProductUrl] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [docUrl, setDocUrl] = useState(BACKUP_GOOGLE_DOC_URL);  // <-- new state

    // fixed label size
    const LABEL_WIDTH = 4;
    const LABEL_HEIGHT = 1;

    const labelRef = useRef<HTMLDivElement>(null);

    // load lab certs
    useEffect(() => {
        (async () => {
            const { success, data } = await fetchAllHempLabCertificates();
            if (success) setLabCertificates(data);
        })();
    }, []);

    function handleProductSelection(fileUrl: string, name: string) {
        setSelectedProductUrl(fileUrl);
        setSelectedProduct(name);
    }

    // download the single label as PNG
    async function downloadLabel() {
        if (!labelRef.current) return;
        const dataUrl = await toPng(labelRef.current);
        const link = document.createElement("a");
        link.download = `${selectedProduct?.replace(/\s+/g, "-").toLowerCase() || "label"}.png`;
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
                                    <SelectItem value="1g">1g</SelectItem>
                                    <SelectItem value="4g">4g</SelectItem>
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
                        <h3 className="text-xl font-bold text-center ">Select a Product</h3>
                        <div className="flex-1 overflow-y-auto dark:bg-slate-800 bg-neutral-300 rounded-lg">
                            <RadioGroup
                                value={selectedProductUrl}
                                onValueChange={(fileUrl) => {
                                    const selectedCert = labCertificates.find(cert => cert.file_url === fileUrl);
                                    if (selectedCert) {
                                        handleProductSelection(fileUrl, selectedCert.name);
                                    }
                                }}
                                className="space-y-2 p-4"
                            >
                                {labCertificates.map((cert) => (
                                    <div key={cert.id} className="flex items-center gap-2">
                                        <RadioGroupItem value={cert.file_url} id={`product-${cert.id}`} />
                                        <Label htmlFor={`product-${cert.id}`} className="cursor-pointer">
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
                <h2 className="text-2xl font-semibold">Label Preview</h2>
                <div ref={labelRef} className="w-full flex flex-col items-center justify-center p-6 border rounded-lg bg-gray-400 shadow-md  ">
                    <IndividualLabelPreview
                        id="preview-label"
                        productName={selectedProduct || "Product Name THCA Flower"}
                        weight={productWeight}
                        qrValue={selectedProductUrl}
                        logoSrc={inhalebaylogo.src}
                        warningText={WARNINGS}
                    />
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button onClick={downloadLabel} disabled={!selectedProductUrl}>
                        Download Label Image
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