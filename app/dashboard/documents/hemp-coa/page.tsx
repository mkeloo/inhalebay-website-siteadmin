"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { coaBaseURL, hempCOA } from "@/lib/index";
import { fetchAllHempLabCertificates, fetchCertificatesURL, HempLabCertificates } from "../../../actions/hempLabCOA";
import { QRCode } from "react-qrcode-logo";
import inhalebaylogo from "@/assets/InhaleBayLogo.svg";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";



export default function HempCertificateOfAnalysis() {
    const [certificates, setCertificates] = useState<HempLabCertificates[]>([]);
    const [certificatesURL, setCertificatesURL] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [thcaFilter, setThcaFilter] = useState<string>("All");

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const certRes = await fetchAllHempLabCertificates();
            if (certRes.success) {
                setCertificates(certRes.data);
            } else {
                setError(certRes.error || "Error fetching certificates");
            }

            try {
                const url = await fetchCertificatesURL();
                setCertificatesURL(url);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const filteredCertificates = certificates.filter(cert => {
        const matchesSearch = cert.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            thcaFilter === "All" || cert.name.includes(thcaFilter);
        return matchesSearch && matchesFilter;
    });

    // Calculate total pages
    const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
    const paginatedCertificates = filteredCertificates.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );


    // Generate QR Code
    const generateQRCode = () => {
        if (!selectedFile) return;
        setQrCodeData(`${certificatesURL}${selectedFile}`);
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
            const selectedFileData = certificates.find((file) => file.file_url === selectedFile);
            const originalName = selectedFileData ? selectedFileData.file_name : "qrcode";
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
            <Card className="w-full p-2 lg:p-6 max-w-[1200px] mx-auto">
                <h2 className="text-xl font-semibold text-center lg:mb-4 py-4">Hemp Certificate of Analysis</h2>

                {/* Search and Filters */}
                <Card className="w-full p-4 max-w-[1200px]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <Input
                            placeholder="Search Certificates..."
                            value={searchQuery}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="md:w-64"
                        />

                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            {/* THCA Filter Dropdown */}
                            <Select value={thcaFilter} onValueChange={(val) => {
                                setThcaFilter(val);
                                setCurrentPage(1);
                            }}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filter by THCA" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All</SelectItem>
                                    <SelectItem value="THCA Flower">THCA Flower</SelectItem>
                                    <SelectItem value="THCA Snowcaps">THCA Snowcaps</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Items Per Page Dropdown */}
                            <Select value={`${itemsPerPage}`} onValueChange={(val) => {
                                setItemsPerPage(Number(val));
                                setCurrentPage(1);
                            }}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Items per page" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 20, 30, 40, 50].map((num) => (
                                        <SelectItem key={num} value={`${num}`}>{num} per page</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                <div className="w-full overflow-x-auto rounded-md border">
                    <Table className="table-auto w-full mb-4 mx-4">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16 border-r">ID</TableHead>
                                <TableHead className="border-r">Name</TableHead>
                                <TableHead className="border-r">File Name</TableHead>
                                <TableHead className="border-r text-center">Actions</TableHead>
                                <TableHead className="border-r">File Type</TableHead>
                                <TableHead className="border-r">File Size</TableHead>
                                <TableHead className="border-r">Created At</TableHead>
                                <TableHead className="border-r">Updated At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : paginatedCertificates.length > 0 ? (
                                paginatedCertificates.map((cert) => (
                                    <TableRow key={cert.id}>
                                        <TableCell className="border-r truncate">{cert.serial_id}</TableCell>
                                        <TableCell className="border-r truncate">{cert.name}</TableCell>
                                        <TableCell className="border-r truncate">{cert.file_name}</TableCell>
                                        <TableCell className="border-r text-center">
                                            <a
                                                href={`${certificatesURL}${cert.file_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                View PDF
                                            </a>
                                        </TableCell>
                                        <TableCell className="border-r">{cert.file_type}</TableCell>
                                        <TableCell className="border-r">{cert.file_size_kb.toFixed(2)} KB</TableCell>
                                        <TableCell className="border-r">{new Date(cert.created_at || "").toLocaleString()}</TableCell>
                                        <TableCell className="border-r">{new Date(cert.updated_at || "").toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                                        No Certificates Found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {error && <p className="text-center text-red-500 mt-4">{error}</p>}


                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-4">
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                        Previous
                    </Button>

                    <span className="text-gray-700 text-sm md:text-base lg:text-lg font-medium">
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
            <Card className="w-full h-full p-2 lg:p-6 pb-12">
                <h2 className="text-xl font-semibold mb-4">QR Code Generator</h2>

                <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center gap-4">
                    {/* Left Side: File Selection */}
                    <Card className="w-full lg:w-1/2 h-auto lg:h-96 p-4 flex flex-col">
                        <h3 className="text-xl font-bold mb-2 text-center py-3">Generate QR Code for Files</h3>

                        {/* Scrollable List */}
                        <div className="h-72 lg:flex-1 overflow-y-auto dark:bg-slate-800 bg-neutral-300 rounded-lg">
                            <RadioGroup
                                value={selectedFile || ""}
                                onValueChange={setSelectedFile}
                                className="space-y-2 p-4"
                            >
                                {certificates.map((file) => (
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
                    <Card className="w-full lg:w-1/2 h-96 p-4 flex flex-col items-center justify-center gap-4 dark:bg-slate-800 bg-neutral-300">
                        {qrCodeData ? (
                            <>
                                <QRCode
                                    id="qrCodeCanvas"
                                    value={qrCodeData}
                                    size={200}
                                    ecLevel="Q"
                                    qrStyle="dots"
                                    fgColor="#000000"
                                    bgColor="#FFFFFF"
                                    style={{ borderRadius: 10 }}
                                    quietZone={10}

                                    // fgColor="#7EC8E3"
                                    // bgColor="#00008B"
                                    // logoImage={inhalebaylogo.src}
                                    // logoWidth={55}
                                    // logoOpacity={1}
                                    // logoPaddingStyle='circle'
                                    // logoPadding={5}
                                    // removeQrCodeBehindLogo={true}

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