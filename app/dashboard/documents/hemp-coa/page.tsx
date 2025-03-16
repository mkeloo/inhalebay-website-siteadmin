"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { coaBaseURL, hempCOA } from "@/lib/index";
import { QRCode } from "react-qrcode-logo";
import inhalebaylogo from "@/assets/InhaleBayLogo.svg";


// Number of items per page
const ITEMS_PER_PAGE = 13;

export default function HempCertificateOfAnalysis() {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);

    // Calculate total pages
    const totalPages = Math.ceil(hempCOA.length / ITEMS_PER_PAGE);

    // Get current page items
    const currentItems = hempCOA.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Generate QR Code
    const generateQRCode = () => {
        if (!selectedFile) return;
        setQrCodeData(`${coaBaseURL}${selectedFile}`);
    };

    // Copy QR Code URL to clipboard
    const copyToClipboard = () => {
        if (qrCodeData) {
            navigator.clipboard.writeText(qrCodeData);
            // alert("QR Code URL copied to clipboard!");
        }
    };

    // Download QR Code as an image
    const downloadQRCode = () => {
        const canvas = document.getElementById("qrCodeCanvas") as HTMLCanvasElement;
        if (canvas && selectedFile) {
            const selectedFileData = hempCOA.find((file) => file.file_url === selectedFile);
            // Use the file name if found; otherwise fallback to a default name
            const originalName = selectedFileData ? selectedFileData.file_name : "qrcode";
            // Sanitize the file name by replacing characters that can cause issues
            const safeName = originalName.replace(/[:\/\\]/g, "_");
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = `QR_CODE_${safeName}.png`;
            link.click();
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-start gap-6 pb-10">
            {/* Table */}
            <Card className="w-full p-6">
                <h2 className="text-xl font-semibold mb-4">Hemp Certificate of Analysis</h2>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">ID</TableHead>
                                <TableHead>File Name</TableHead>
                                <TableHead>File Type</TableHead>
                                <TableHead className="w-32">File Size</TableHead>
                                <TableHead className="w-32 text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentItems.map((file) => (
                                <TableRow key={file.id}>
                                    <TableCell>{file.id}</TableCell>
                                    <TableCell className="truncate max-w-xs">{file.file_name}</TableCell>
                                    <TableCell>{file.file_type}</TableCell>
                                    <TableCell>{file.file_size_kb.toFixed(2)} KB</TableCell>
                                    <TableCell className="text-center">
                                        <a
                                            href={`${coaBaseURL}${file.file_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            View PDF
                                        </a>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-4">
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                        Previous
                    </Button>

                    <span className="text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>

                    <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    >
                        Next
                    </Button>
                </div>
            </Card>

            {/* QR Code Generator for the PDF Files */}
            <Card className="w-full h-full p-6 pb-12">
                <h2 className="text-xl font-semibold mb-4">QR Code Generator</h2>

                <div className="w-full h-full flex flex-row items-center justify-center gap-4">
                    {/* Left Side: File Selection */}
                    <Card className="w-1/2 h-96 p-4 flex flex-col">
                        <h3 className="text-xl font-bold mb-2 text-center py-3">Generate QR Code for Files</h3>

                        {/* Scrollable List */}
                        <div className="flex-1 overflow-y-auto dark:bg-slate-800 bg-neutral-300 rounded-lg">
                            <RadioGroup
                                value={selectedFile || ""}
                                onValueChange={setSelectedFile}
                                className="space-y-2 p-4"
                            >
                                {hempCOA.map((file) => (
                                    <div key={file.id} className="flex items-center gap-2">
                                        <RadioGroupItem value={file.file_url} id={`file-${file.id}`} />
                                        <Label htmlFor={`file-${file.id}`} className="cursor-pointer">
                                            {file.file_name}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Fixed Button */}
                        <Button
                            className="mt-4 w-full"
                            onClick={generateQRCode}
                            disabled={!selectedFile}
                        >
                            Generate
                        </Button>
                    </Card>

                    {/* Right Side: QR Code Display */}
                    <Card className="w-1/2 h-96 p-4 flex flex-col items-center justify-center gap-4 dark:bg-slate-800 bg-neutral-300">
                        {qrCodeData ? (
                            <>
                                <QRCode
                                    id="qrCodeCanvas"
                                    value={qrCodeData}
                                    size={200}
                                    ecLevel="Q"
                                    qrStyle="dots"
                                    fgColor="#FFFFFF"
                                    bgColor="#000000"
                                    style={{ borderRadius: 10 }}
                                    quietZone={10}

                                    // fgColor="#7EC8E3"
                                    // bgColor="#00008B"
                                    logoImage={inhalebaylogo.src}
                                    logoWidth={55}
                                    logoOpacity={1}
                                    logoPaddingStyle='circle'
                                    logoPadding={5}
                                    removeQrCodeBehindLogo={true}

                                    /*
                                      Use eyeRadius to give the QR code "eyes" (corner squares) rounded corners.
                                      You can define a single object for all corners OR an array of objects
                                      for top-left, top-right, bottom-left corners.
                                    */
                                    eyeRadius={[
                                        // Top-left eye
                                        { outer: 12, inner: 4 },
                                        // Top-right eye
                                        { outer: 12, inner: 4 },
                                        // Bottom-left eye
                                        { outer: 12, inner: 4 },
                                    ]}
                                // eyeColor={"#00008B"}

                                />
                                <p className="text-sm text-center break-all">{qrCodeData}</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={copyToClipboard}>
                                        Copy
                                    </Button>
                                    <Button variant="outline" onClick={downloadQRCode}>
                                        Download
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-500">Select a file to generate QR code.</p>
                        )}
                    </Card>
                </div>
            </Card>
        </div>
    );
}