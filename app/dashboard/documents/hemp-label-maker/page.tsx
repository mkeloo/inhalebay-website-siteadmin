"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    fetchAllHempLabCertificates,
    HempLabCertificates,
} from "../../../actions/hempLabCOA";
import { SheetPreview, LabelPlacement } from "@/components/siteadmin/LabelMaker/SheetPreview";
import inhalebaylogo from "@/assets/InhaleBayLogo.svg";

const WARNINGS =
    "Warning: This product contains hemp-derived compounds. Keep out of reach of children.";

export default function HempLabelMaker() {
    const [labCertificates, setLabCertificates] = useState<HempLabCertificates[]>([]);
    const [productWeight, setProductWeight] = useState("1g");
    const [numLabels, setNumLabels] = useState(1);
    const [selectedProductUrl, setSelectedProductUrl] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");

    // fixed dimensions
    const LABEL_WIDTH = 4;
    const LABEL_HEIGHT = 1;

    // placements: one per label, each with a slotIndex 0–19
    const [placements, setPlacements] = useState<LabelPlacement[]>([]);

    // whenever numLabels changes, re-init placements 0..numLabels-1
    useEffect(() => {
        const initial: LabelPlacement[] = Array.from({ length: numLabels }).map((_, i) => ({
            id: `label-${i}`,
            slotIndex: i,
        }));
        setPlacements(initial);
    }, [numLabels]);

    useEffect(() => {
        async function load() {
            const { success, data } = await fetchAllHempLabCertificates();
            if (success) setLabCertificates(data);
        }
        load();
    }, []);

    function handleProductSelection(fileUrl: string, name: string) {
        setSelectedProductUrl(fileUrl);
        setSelectedProduct(name);
    }

    return (
        <div className="space-y-6">
            {/* Controls */}
            <Card className="p-6 space-y-6 max-w-2xl mx-auto">
                <h2 className="text-3xl font-semibold text-center">Hemp Label Maker</h2>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                    <div>
                        <Label># of Labels</Label>
                        <input
                            type="number"
                            min={1}
                            max={20}
                            value={numLabels}
                            onChange={(e) =>
                                setNumLabels(
                                    Math.max(1, Math.min(20, Number(e.currentTarget.value)))
                                )
                            }
                            className="mt-1 w-full rounded border px-2 py-1"
                        />
                    </div>
                </div>

                <Card className="w-full h-80 p-4">
                    <h3 className="text-xl font-bold text-center">Select a Product</h3>
                    <div className="overflow-y-auto h-full rounded-lg p-4">
                        <RadioGroup
                            value={selectedProductUrl}
                            onValueChange={(url) => {
                                const cert = labCertificates.find((c) => c.file_url === url);
                                if (cert) handleProductSelection(url, cert.name);
                            }}
                            className="space-y-3"
                        >
                            {labCertificates.map((cert) => (
                                <div key={cert.id} className="flex items-center">
                                    <RadioGroupItem value={cert.file_url} id={cert.id} />
                                    <Label htmlFor={cert.id} className="ml-2 cursor-pointer">
                                        {cert.name}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </Card>
            </Card>

            {/* Sheet Preview */}
            <div className="max-w-4xl mx-auto p-4">
                <h2 className="text-2xl font-semibold mb-4 text-center">Sheet Preview</h2>
                <SheetPreview
                    placements={placements}
                    numLabels={numLabels}
                    productName={selectedProduct}
                    weight={productWeight}
                    qrValue={selectedProductUrl}
                    logoSrc={inhalebaylogo.src}
                    warningText={WARNINGS}
                    onReorder={setPlacements}
                />
            </div>
        </div>
    );
}