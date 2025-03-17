"use client";

import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchAllHempLabCertificates } from "../../../actions/hempLabCOA";
import { QRCode } from "react-qrcode-logo";
import inhalebaylogo from "@/assets/InhaleBayLogo.svg";
import { coaBaseURL, hempCOA } from "@/lib/index";
import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
import { toPng } from "html-to-image";


// 1 inch ~ 96px (approx)
const INCH_TO_PX = 96;

const WARNINGS = "Warning: This product contains hemp-derived compounds. Keep out of reach of children.";
const LOGO_PLACEHOLDER = inhalebaylogo;

export default function HempLabelMaker() {
    // States for label size
    const [labelWidth, setLabelWidth] = useState(3);   // default 3 inches
    const [labelHeight, setLabelHeight] = useState(4); // default 4 inches

    // States for label content
    const [productName, setProductName] = useState("");
    const [productWeight, setProductWeight] = useState("1g");
    const [qrCodeValue, setQrCodeValue] = useState("");
    const [generatedQR, setGeneratedQR] = useState("");
    const [selectedFile, setSelectedFile] = useState<string>("");

    // NEW: Refs for the label previews
    const frontLabelRef = useRef<HTMLDivElement>(null!);
    const backLabelRef = useRef<HTMLDivElement>(null!);


    function handleGenerateQR() {
        if (!qrCodeValue) return;
        setGeneratedQR(qrCodeValue);
    }


    // Use html-to-image instead of html2canvas:
    async function downloadPDF(ref: React.RefObject<HTMLDivElement>, filename: string) {
        if (!ref.current) return;
        try {
            const dataUrl = await toPng(ref.current);
            const img = new Image();
            img.src = dataUrl;
            img.onload = () => {
                const pdf = new jsPDF({
                    orientation: "portrait",
                    unit: "px",
                    format: [img.width, img.height],
                });
                pdf.addImage(img, "PNG", 0, 0, img.width, img.height);
                pdf.save(filename);
            };
        } catch (error) {
            console.error("Failed to create PDF:", error);
        }
    }

    async function downloadImage(ref: React.RefObject<HTMLDivElement>, filename: string) {
        if (!ref.current) return;
        try {
            const dataUrl = await toPng(ref.current);
            const link = document.createElement("a");
            link.download = filename;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Failed to create image:", error);
        }
    }

    // Inline styles for labels
    const styleFront: React.CSSProperties = {
        width: `${labelWidth * INCH_TO_PX}px`,
        height: `${labelHeight * INCH_TO_PX}px`,
        border: "1px solid #ccc",
        padding: "8px",
        position: "relative",
        color: "#000000",
        backgroundColor: "#FFFFFF",
    };
    const styleBack: React.CSSProperties = {
        width: `${labelWidth * INCH_TO_PX}px`,
        height: `${labelHeight * INCH_TO_PX}px`,
        border: "1px solid #ccc",
        padding: "8px",
        position: "relative",
        color: "#000000",
        backgroundColor: "#FFFFFF",
    };

    return (
        <div className="p-6 space-y-6">
            <Card className="p-4 space-y-4">
                <h2 className="text-xl font-semibold mb-2">Hemp Label Maker</h2>

                {/* LABEL SIZE */}
                <div className="flex items-center gap-4">
                    <div>
                        <Label>Label Width (inches)</Label>
                        <Select value={String(labelWidth)} onValueChange={(val) => setLabelWidth(Number(val))}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Width" />
                            </SelectTrigger>
                            <SelectContent>
                                {[...Array(10)].map((_, i) => {
                                    const inch = i + 1;
                                    return (
                                        <SelectItem key={inch} value={String(inch)}>
                                            {inch}"
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Label Height (inches)</Label>
                        <Select value={String(labelHeight)} onValueChange={(val) => setLabelHeight(Number(val))}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Height" />
                            </SelectTrigger>
                            <SelectContent>
                                {[...Array(10)].map((_, i) => {
                                    const inch = i + 1;
                                    return (
                                        <SelectItem key={inch} value={String(inch)}>
                                            {inch}"
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* PRODUCT NAME + WEIGHT */}
                <div className="flex items-center gap-4">
                    <div>
                        <Label htmlFor="productName">Product Name</Label>
                        <Input
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="e.g. Hybrid Hemp"
                        />
                    </div>

                    <div>
                        <Label>Weight</Label>
                        <Select value={productWeight} onValueChange={setProductWeight}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1g">1g</SelectItem>
                                <SelectItem value="4g">4g</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* QR CODE INPUT with File Selector */}
                <div className="flex gap-4">
                    {/* Left Side: File Selector */}
                    <Card className="w-1/2 h-96 p-4 flex flex-col">
                        <h3 className="text-xl font-bold mb-2 text-center py-3">
                            Select a Document
                        </h3>
                        <div className="flex-1 overflow-y-auto dark:bg-slate-800 bg-neutral-300 rounded-lg">
                            <RadioGroup
                                value={selectedFile || ""}
                                onValueChange={(val) => {
                                    setSelectedFile(val);
                                    setQrCodeValue(val); // automatically copy the selected file URL
                                }}
                                className="space-y-2 p-4"
                            >
                                {hempCOA.map((file) => {
                                    const fileUrl = `${coaBaseURL}${file.file_url}`;
                                    return (
                                        <div key={file.id} className="flex items-center gap-2">
                                            <RadioGroupItem value={fileUrl} id={`file-${file.id}`} />
                                            <Label htmlFor={`file-${file.id}`} className="cursor-pointer">
                                                {file.file_name}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </RadioGroup>
                        </div>
                    </Card>

                    {/* Right Side: Manual QR Code Input */}
                    <div className="w-1/2 space-y-2">
                        <Label>QR Code Link or Text</Label>
                        <Input
                            value={qrCodeValue}
                            onChange={(e) => setQrCodeValue(e.target.value)}
                            placeholder="e.g. https://example.com/lab-report"
                        />
                        <Button onClick={handleGenerateQR}>Generate QR</Button>
                    </div>
                </div>
            </Card>

            {/* LABEL PREVIEW CONTAINER */}
            <div className="w-full flex flex-row items-center justify-center gap-10 rounded-2xl p-10"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}  // use rgba here instead of an oklch function
            >
                {/* FRONT LABEL */}
                <div className="w-full flex flex-col items-center justify-center gap-y-2">
                    <h1 className="text-2xl text-center text-white font-bold">FRONT LABEL</h1>
                    <Card ref={frontLabelRef} className="p-4 space-y-2 !rounded-none" style={styleFront}>
                        <div className="flex justify-center items-center">
                            <img src={LOGO_PLACEHOLDER.src} alt="Logo" style={{ maxHeight: 40 }} />
                        </div>
                        <div className="text-center mt-2">
                            <h3 className="font-bold">{productName || "Product Name"}</h3>
                            <p>{productWeight}</p>
                        </div>
                        {generatedQR && (
                            <div className="absolute bottom-2 right-2">
                                <QRCode
                                    value={generatedQR}
                                    size={120}
                                    ecLevel="H"
                                    qrStyle="dots"
                                    fgColor="#000000"
                                    bgColor="#FFFFFF"
                                    style={{ borderRadius: 10 }}
                                    quietZone={0}
                                    eyeRadius={[
                                        { outer: 12, inner: 4 },
                                        { outer: 12, inner: 4 },
                                        { outer: 12, inner: 4 },
                                    ]}
                                />
                            </div>
                        )}
                    </Card>
                </div>

                {/* BACK LABEL */}
                <div className="w-full flex flex-col items-center justify-center gap-y-2">
                    <h1 className="text-2xl text-center text-white font-bold">BACK LABEL</h1>
                    <Card ref={backLabelRef} className="p-4 space-y-2 !rounded-none" style={styleBack}>
                        <h4 className="font-bold">Warnings:</h4>
                        <p className="text-sm">{WARNINGS}</p>
                        <p className="text-xs absolute bottom-2">
                            Hemp product. Keep away from children. For legal use only.
                        </p>
                    </Card>
                </div>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="w-full flex flex-col items-center justify-center gap-4 mt-6">
                <div className="flex gap-4">
                    <Button onClick={() => downloadPDF(frontLabelRef, `${productName ? productName.replace(/\s+/g, "-").toLowerCase() + "-front-label" : "front-label"}.pdf`)}>
                        Download Front as PDF
                    </Button>
                    <Button onClick={() => downloadPDF(backLabelRef, `${productName ? productName.replace(/\s+/g, "-").toLowerCase() + "-back-label" : "back-label"}.pdf`)}>
                        Download Back as PDF
                    </Button>
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => downloadImage(frontLabelRef, `${productName ? productName.replace(/\s+/g, "-").toLowerCase() + "-front-label" : "front-label"}.png`)}>
                        Download Front as Image
                    </Button>
                    <Button onClick={() => downloadImage(backLabelRef, `${productName ? productName.replace(/\s+/g, "-").toLowerCase() + "-back-label" : "back-label"}.png`)}>
                        Download Back as Image
                    </Button>
                </div>
            </div>
        </div>
    );
}