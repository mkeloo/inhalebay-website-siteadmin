// components/label/IndividualLabelPreview.tsx
import React, { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { QRCode } from "react-qrcode-logo";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import { getExpirationDate } from "@/utils/functions";

export interface IndividualLabelPreviewProps {
    id: string;
    productName: string;
    weight: string;
    batchNumber?: string;
    thcaMgPerGram?: number;
    qrValue: string;
    logoSrc: string;
    listeners?: DraggableSyntheticListeners;
    attributes?: React.HTMLAttributes<HTMLDivElement>;
}

const INCH_TO_PX = 96;
const OUTER_WIDTH_PX_VERTICAL = 0.90 * INCH_TO_PX;
const LABEL_HEIGHT_PX_VERTICAL = 3.85 * INCH_TO_PX;
const CONTENT_HEIGHT_PX_VERTICAL = 3.60 * INCH_TO_PX;
const VERTICAL_MARGIN = (LABEL_HEIGHT_PX_VERTICAL - CONTENT_HEIGHT_PX_VERTICAL) / 2;

const WARNINGS = [
    "Not Intended For Ingestion – Do Not Eat.",
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
                        className="absolute inset-x-0 border-t border-red-500"
                        style={{ top: VERTICAL_MARGIN }}
                    />
                    <div
                        className="absolute inset-x-0 border-b border-red-500"
                        style={{ top: VERTICAL_MARGIN + CONTENT_HEIGHT_PX_VERTICAL }}
                    />

                    {/* Centered content area */}
                    <div
                        className="absolute inset-x-0 flex flex-col items-center justify-center"
                        style={{
                            height: CONTENT_HEIGHT_PX_VERTICAL,
                            top: VERTICAL_MARGIN
                        }}
                    >
                        {/* Logo & Address */}
                        <div className="flex flex-col items-center rotate-90">
                            <img
                                src={logoSrc}
                                alt="Logo"
                                className="w-[45px] h-auto"
                            />
                            <div className="text-[6px] text-center mt-1">
                                Inhale Bay Smoke Shop<br />
                                5751 N Main St, #108<br />
                                Jacksonville, FL 32208
                            </div>
                        </div>

                        {/* Warnings & Weights */}
                        <div className="text-[6px] text-center mt-2">
                            {WARNINGS.map((line, i) => (
                                <React.Fragment key={i}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            ))}
                            <p> Net Wt: {weight} ({ounceEquivalent(parseFloat(weight))})</p>
                            <p>Serv Size: {weight} </p>
                            <p>Qty: 1</p>
                        </div>

                        {/* Main Product Name & 21+ */}
                        <div className="flex flex-col items-center mt-2 rotate-90">

                            <h4 className="font-bold text-[14px] text-center leading-tight mt-2">
                                {firstLine}
                                {secondLine && (
                                    <span className="block text-[12px] font-medium">{secondLine}</span>
                                )}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs font-bold">{weight}</span>
                                <div className="w-5 h-4 rounded border-2 border-red-500 flex items-center justify-center">
                                    <span className="text-[7px] font-bold tracking-tighter">21+</span>
                                </div>
                            </div>
                        </div>

                        {/* QR & Batch/THCA/Exp */}
                        <div className="flex flex-col items-center mt-4 rotate-90">
                            <p className="text-[6px] italic mb-1">Lab Report</p>
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

                            {/* Batch/Exp placeholders */}
                            <div className="text-[6px] text-center">
                                <div>Batch#: {batchNumber}</div>
                                <div>THCA: {thcaMgPerGram} mg per serving</div>
                                <div>Exp: {getExpirationDate()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }
);

VerticalLabelPreview.displayName = "VerticalLabelPreview";
