"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchAllHempLabCertificates, HempLabCertificates } from "../../../actions/hempLabCOA";
import { QRCode } from "react-qrcode-logo";
import inhalebaylogo from "@/assets/InhaleBayLogo.svg";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

// 1 inch ~ 96px (approx)
const INCH_TO_PX = 96;

const WARNINGS = "Warning: This product contains hemp-derived compounds. Keep out of reach of children.";
const LOGO_PLACEHOLDER = inhalebaylogo;

export default function HempLabelMaker() {
    // At the top of your component:
    const [zoomLevel, setZoomLevel] = useState(1);

    // Handlers:
    const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2)); // max 200%
    const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.2)); // min 20%
    const handleResetZoom = () => setZoomLevel(1);

    const [labCertificates, setLabCertificates] = useState<HempLabCertificates[]>([]);

    // Selected product name (instead of a dropdown)
    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [selectedProductUrl, setSelectedProductUrl] = useState<string>("");

    // Label size states
    const [labelWidth, setLabelWidth] = useState(3);
    const [labelHeight, setLabelHeight] = useState(4);
    const [productWeight, setProductWeight] = useState("1g");
    const [generatedQR, setGeneratedQR] = useState("");

    // Refs for label previews
    const frontLabelRef = useRef<HTMLDivElement>(null!);
    const backLabelRef = useRef<HTMLDivElement>(null!);

    // Fetch hemp lab certificates when component mounts
    useEffect(() => {
        async function loadData() {
            const { success, data } = await fetchAllHempLabCertificates();
            if (success) {
                setLabCertificates(data);
            }
        }
        loadData();
    }, []);

    // Handle product selection
    function handleProductSelection(fileUrl: string, productName: string) {
        setSelectedProduct(productName);
        setSelectedProductUrl(fileUrl);
        setGeneratedQR(fileUrl); // Set QR code value based on file URL
    }

    // Helper function to download labels as PDF
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

    // Helper function to download labels as Image
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
        <div className="space-y-6">
            <Card className="p-4 space-y-4">
                <h2 className="text-2xl lg:text-3xl font-semibold mb-2 text-center">Hemp Label Maker</h2>

                <div className="w-full flex flex-col items-center justify-between gap-6 lg:max-w-2xl mx-auto">
                    {/* LABEL SIZE */}
                    <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 px-4 lg:px-0">
                        <div className="w-full lg:w-auto">
                            <Label>Label Width (inches)</Label>
                            <Select value={String(labelWidth)} onValueChange={(val) => setLabelWidth(Number(val))}>
                                <SelectTrigger className="w-full lg:w-[120px]">
                                    <SelectValue placeholder="Width" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[...Array(10)].map((_, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)}>
                                            {i + 1}"
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full lg:w-auto">
                            <Label>Label Height (inches)</Label>
                            <Select value={String(labelHeight)} onValueChange={(val) => setLabelHeight(Number(val))}>
                                <SelectTrigger className="w-full lg:w-[120px]">
                                    <SelectValue placeholder="Height" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[...Array(10)].map((_, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)}>
                                            {i + 1}"
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>


                        <div className="w-full lg:w-auto">
                            <Label>Weight</Label>
                            <Select value={productWeight} onValueChange={setProductWeight}>
                                <SelectTrigger className="w-full lg:w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1g">1g</SelectItem>
                                    <SelectItem value="4g">4g</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* PRODUCT SELECTION FROM VERTICAL LIST */}
                    <Card className="w-full h-96 p-2 md:p-4 flex flex-col">
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

            {/* LABEL PREVIEW CONTAINER */}
            <div className="w-full overflow-auto flex flex-col items-center justify-center gap-4 border md:p-4 rounded-lg">
                <h2 className="text-2xl lg:text-3xl font-semibold mb-2 text-center">Label Preview</h2>

                {/* ZOOM CONTROLS */}
                <div className="flex gap-4 items-center">
                    <Button onClick={handleZoomOut}>-</Button>
                    <span className="text-white font-semibold">{Math.round(zoomLevel * 100)}%</span>
                    <Button onClick={handleZoomIn}>+</Button>
                    <Button variant="secondary" onClick={handleResetZoom}>Reset</Button>
                </div>

                <div
                    className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-10 rounded-2xl p-4 lg:p-10 overflow-auto"
                    style={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                    }}
                >
                    {/* FRONT LABEL */}
                    <div
                        className="flex-shrink-0 transition-transform"
                        style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
                    >
                        <div className="flex flex-col items-center gap-y-2">
                            <h1 className="text-lg md:text-xl lg:text-2xl text-center text-white font-bold">FRONT LABEL</h1>
                            <Card ref={frontLabelRef} className="p-4 space-y-2 !rounded-none" style={styleFront}>
                                <div className="flex justify-center items-center">
                                    <img src={LOGO_PLACEHOLDER.src} alt="Logo" style={{ maxHeight: 40 }} />
                                </div>
                                <div className="text-center mt-2">
                                    <h3 className="font-bold">{selectedProduct || "Product Name"}</h3>
                                    <p>{productWeight}</p>
                                </div>
                                {generatedQR && (
                                    <div className="absolute bottom-2 right-2">
                                        <QRCode
                                            value={generatedQR}
                                            size={110}
                                            ecLevel="H"
                                            qrStyle="dots"
                                            fgColor="#000000"
                                            bgColor="#FFFFFF"
                                            style={{ borderRadius: 10, border: "2px solid #000000" }}
                                            quietZone={5}
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
                    </div>

                    {/* BACK LABEL */}
                    <div
                        className="flex-shrink-0 transition-transform"
                        style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
                    >
                        <div className="flex flex-col items-center gap-y-2">
                            <h1 className="text-lg md:text-xl lg:text-2xl text-center text-white font-bold">BACK LABEL</h1>
                            <Card ref={backLabelRef} className="p-4 space-y-2 !rounded-none" style={styleBack}>
                                <h4 className="font-bold">Warnings:</h4>
                                <p className="text-sm">{WARNINGS}</p>
                                <p className="text-xs absolute bottom-2">
                                    Hemp product. Keep away from children. For legal use only.
                                </p>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="w-full flex flex-col items-center justify-center gap-4 mt-6">
                <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4">
                    <Button onClick={() => downloadPDF(frontLabelRef, `${selectedProduct ? selectedProduct.replace(/\s+/g, "-").toLowerCase() + "-front-label" : "front-label"}.pdf`)}>
                        Download Front as PDF
                    </Button>
                    <Button onClick={() => downloadPDF(backLabelRef, `${selectedProduct ? selectedProduct.replace(/\s+/g, "-").toLowerCase() + "-back-label" : "back-label"}.pdf`)}>
                        Download Back as PDF
                    </Button>
                </div>
                <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4">
                    <Button onClick={() => downloadImage(frontLabelRef, `${selectedProduct ? selectedProduct.replace(/\s+/g, "-").toLowerCase() + "-front-label" : "front-label"}.png`)}>
                        Download Front as Image
                    </Button>
                    <Button onClick={() => downloadImage(backLabelRef, `${selectedProduct ? selectedProduct.replace(/\s+/g, "-").toLowerCase() + "-back-label" : "back-label"}.png`)}>
                        Download Back as Image
                    </Button>
                </div>
            </div>
        </div>
    );
}