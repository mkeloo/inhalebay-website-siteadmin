// components/label/IndividualLabelPreview.tsx
import React, { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { QRCode } from "react-qrcode-logo";
import { getExpirationDate } from "@/utils/functions";
import { IndividualLabelPreviewProps } from "@/lib/types";
import wave from "@/public/svgs/wave-1.svg";

const INCH_TO_PX = 96;
const OUTER_WIDTH_PX_VERTICAL = 0.90 * INCH_TO_PX;
const LABEL_HEIGHT_PX_VERTICAL = 3.85 * INCH_TO_PX;
const CONTENT_HEIGHT_PX_VERTICAL = 3.60 * INCH_TO_PX;
const VERTICAL_MARGIN = (LABEL_HEIGHT_PX_VERTICAL - CONTENT_HEIGHT_PX_VERTICAL) / 2;

const WARNINGS = [
    "Not Intended For Ingestion",
    "Do Not Eat.",
    "Keep away from children."
];

const ounceEquivalent = (grams: number) =>
    (grams * 0.035274).toFixed(2) + " oz";

export const VerticalLabelPreview = React.forwardRef<
    HTMLDivElement,
    IndividualLabelPreviewProps
>(
    (
        { id, productName, weight, batchNumber, thcaMgPerGram, qrValue, logoSrc, listeners, attributes },
        ref
    ) => {
        const wrapperRef = useRef<HTMLDivElement>(null);
        useEffect(() => {
            if (wrapperRef.current) wrapperRef.current.style.position = 'relative';
        }, []);

        const match = productName.match(/(.*?)\s*(THCA\s+(?:Flower|Snowcaps))/i);
        const firstLine = match ? match[1].trim() : productName;
        const secondLine = match ? match[2].trim() : "";

        return (
            <Card
                ref={ref}
                id={id}
                {...attributes}
                {...listeners}
                className="w-full flex flex-col items-center bg-white text-black rounded shadow-sm"
                style={{ width: OUTER_WIDTH_PX_VERTICAL, height: LABEL_HEIGHT_PX_VERTICAL }}
            >
                <div ref={wrapperRef} className="w-full h-full">
                    {/* Indicator lines for content bounds */}
                    <div
                        className="absolute inset-x-0 border-t border-red-5000"
                        style={{ top: VERTICAL_MARGIN }}
                    />
                    <div
                        className="absolute inset-x-0 border-b border-red-5000"
                        style={{ top: VERTICAL_MARGIN + CONTENT_HEIGHT_PX_VERTICAL }}
                    />

                    {/* Centered content area ----------------------------- */}
                    <div
                        className="absolute inset-x-0 flex flex-col items-center justify-between overflow-hidden bg-no-repeat bg-bottom"
                        style={{
                            height: CONTENT_HEIGHT_PX_VERTICAL,
                            top: VERTICAL_MARGIN,
                        }}
                    >
                        <div className="w-full h-fit bg-yellow-2000 border-b-[1px] border-black">

                            {/* Logo & Address */}
                            <div className="w-full h-full flex flex-col items-center justify-center rotate-90 mb-4">
                                <img
                                    src={logoSrc}
                                    alt="Logo"
                                    className="w-[47px] h-auto"
                                />
                                <div className="w-full text-[6px] text-center">
                                    <p className="text-[6.5px] font-bold w-full flex flex-col items-center mt-[2px] mb-[3px] leading-[7px]">
                                        {/* <span>Inhale Bay</span> */}
                                        <span>Smoke Shop</span>
                                    </p>
                                    <p className="w-full flex flex-col items-center leading-[6px]">
                                        <span>5751 N Main St, #108</span>
                                        <span>Jacksonville, FL 32208</span>
                                    </p>
                                </div>

                                <div className="w-full text-[6px] text-center mt-[3px] tracking-wider font-medium">
                                    <p>inhalebaysmokeshop.com</p>
                                </div>

                            </div>


                        </div>

                        {/* ------------------------ Center Content ------------------------ */}
                        <div
                            className="w-full h-full flex flex-col items-center justify-center"
                            style={{
                                background: `
                                        conic-gradient(
                                            from -30deg,
                                            rgba(186,230,253,0.25) 0deg   100deg,   /* light sky blue */
                                            rgba(56,189,248,0.25) 100deg 220deg,    /* sky blue */
                                            rgba(2,132,199,0.25)  220deg 360deg     /* deep sky blue */
                                        )
                                `,
                                backgroundSize: "100% 100%",
                            }}
                        >
                            {/* Main Product Name & 21+ */}
                            <div className="w-full h-full flex flex-col items-center justify-center rotate-90 blur-none">

                                <div className="w-36 flex flex-col items-center justify-center bg-sky-4000"
                                    style={{
                                        height: OUTER_WIDTH_PX_VERTICAL,
                                    }}
                                >
                                    <div className="w-full h-1/2 flex flex-col items-center justify-center">
                                        <p className="text-[7px] font-bold leading-0 mt-1 mb-[3px] tracking-wider">Inhale Bay Smoke Shop</p>

                                        {/* Product Name */}
                                        <h4 className="w-full font-bold text-center leading-tight block whitespace-nowrap">
                                            <span className="text-[14px]">{firstLine}</span>
                                            {secondLine && (
                                                <span className="block text-[9px] font-normal leading-[7px]">{secondLine}</span>
                                            )}
                                        </h4>
                                    </div>

                                    <div className="w-full h-1/2 flex flex-col items-center justify-center">
                                        <div className="w-full h-full flex flex-row items-center justify-between mt-1 ">
                                            {/* Weights */}
                                            <div className="w-1/2 h-full text-[6px] text-left leading-[7px] flex flex-col items-start justify-center">
                                                <p>Net Wt: <span className="tracking-[0.05px] font-bold">{weight} ({ounceEquivalent(parseFloat(weight))})</span> </p>
                                                <p>Serving Size: <span className="tracking-[0.05px] font-bold">{weight}</span> </p>
                                                <p>Qty: <span className="tracking-[0.05px] font-bold">1</span></p>
                                            </div>

                                            {/* 21+ Indicator */}
                                            <div className="w-1/2 flex items-center justify-end gap-1">
                                                <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center">
                                                    <span className="text-[7px] font-bold tracking-tighter">21+</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Warning */}
                                        <div className="text-[5.5px] font-mono text-center leading-tight mb-[2px]">
                                            {WARNINGS.slice(0, -1).map((line, i, arr) => (
                                                <React.Fragment key={i}>
                                                    {line}
                                                    {i < arr.length - 1 && " - "}
                                                </React.Fragment>
                                            ))}
                                        </div>


                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Centered Content Area ----------------------------- */}

                        <div className="w-full h-fit bg-emerald-3000 flex flex-col items-center justify-between  border-t-[1px] border-black">
                            {/* QR & Batch/THCA/Exp */}
                            <div className="w-full h-full flex flex-col items-center">
                                <div className="h-full flex flex-col items-center justify-center mt-1 mb-[2.5px]">
                                    <QRCode
                                        value={qrValue}
                                        size={400}
                                        ecLevel="H"
                                        qrStyle="squares"
                                        fgColor="#000000"
                                        bgColor="#FFFFFF"
                                        quietZone={8}
                                        eyeRadius={[{ outer: 12, inner: 4 }, { outer: 12, inner: 4 }, { outer: 12, inner: 4 }]}
                                        style={{ width: "0.40in", height: "0.40in" }}
                                    />
                                    <p className="text-[5px] italic mt-[1px] font-bold">Certificate Of Analysis</p>

                                </div>

                                {/* Batch/Exp placeholders */}
                                <p className="w-full h-full text-[5px] text-left leading-tight grid grid-cols-[auto_1fr]">
                                    <span className="font-semibold">Batch:</span>
                                    <span className="justify-self-end tracking-tighter">{batchNumber}</span>

                                    <span className="font-semibold">THCA:</span>
                                    <span className="justify-self-end">{thcaMgPerGram} mg per serving</span>

                                    <span className="font-semibold">Exp:</span>
                                    <span className="justify-self-end">{getExpirationDate()}</span>
                                </p>
                            </div>

                            {/* Separator */}
                            <div className="w-full h-[0.75px] bg-black my-[2px]" />

                            {/* Warnings */}
                            <div className="h-full text-[5px] text-center leading-tight">
                                {WARNINGS.map((line, i) => (
                                    <React.Fragment key={i}>
                                        {line}
                                        <br />
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>


                </div>
            </Card >
        );
    }
);

VerticalLabelPreview.displayName = "VerticalLabelPreview";
