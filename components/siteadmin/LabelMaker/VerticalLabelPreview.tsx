// components/label/IndividualLabelPreview.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { QRCode } from "react-qrcode-logo";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import { getExpirationDate } from "@/utils/functions";

export interface IndividualLabelPreviewProps {
    id: string;
    productName: string;
    weight: string;
    batchNumber?: string; // Optional, can be null
    thcaMgPerGram?: number; // Optional, can be null
    qrValue: string;
    logoSrc: string;
    listeners?: DraggableSyntheticListeners;
    attributes?: React.HTMLAttributes<HTMLDivElement>;
}

const INCH_TO_PX = 96;
// Vertical dimensions: narrow width, tall height
const OUTER_WIDTH_PX_VERTICAL = 0.90 * INCH_TO_PX; // ~0.90" wide
const LABEL_HEIGHT_PX_VERTICAL = 3.85 * INCH_TO_PX; // ~3.85" tall
const CONTENT_HEIGHT_PX_VERTICAL = 3.60 * INCH_TO_PX; // ~3.60" content span

// const WARNINGS = [
//     "Warning: Keep out of reach of children.",
//     "Not Intended For Ingestion – Do Not Eat."
// ];

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
                <div
                    className="w-full flex flex-col items-center justify-center"
                    style={{ height: CONTENT_HEIGHT_PX_VERTICAL }}
                >
                    {/* Logo & Shop Name */}
                    <div className="w-[] flex flex-col items-center border border-black ">
                        <div className="flex flex-col items-center rotate-90">
                            <img
                                src={logoSrc}
                                alt="Logo"
                                className="w-[50px] h-auto border border-black rounded p-1"
                            />
                            <div className="text-[7px] font-mono font-bold text-center mt-[2px]">
                                <div>Inhale Bay</div>
                                {/* <div>Smoke Shop</div> */}
                            </div>
                            <div className="text-[5px] font-mono font-semibold text-center">
                                inhalebaysmokeshop.com
                            </div>
                        </div>

                        {/* Warnings */}
                        <p className="text-[6px] text-left mt-[5px]">
                            {WARNINGS.map((line, i) => (
                                <React.Fragment key={i}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            ))}
                        </p>

                        <div className="text-[6px] text-center mt-1">
                            <div>Net Wt: {weight} ({ounceEquivalent(parseFloat(weight))})</div>
                            <div>Serving Size: {weight}</div>
                            <div>Servings per Container: 1</div>
                        </div>
                    </div>

                    {/* Main Product Identity */}
                    <div className="flex flex-col items-center mt-2 rotate-90 border border-black">

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


                    {/* Additional Info */}
                    <div className="w-[] flex flex-col items-center mt-2 text-[6px] border border-black">




                        {/* Company Address */}
                        <div className="text-[6px] text-left">
                            {/* <div>Distributed by: Discount Pharms, Anytown FL</div> */}
                            {/* <div>Permit # HEMP-XXXX</div> */}
                            <div>Inhale Bay Smoke Shop</div>
                            <p>
                                5751 N Main St, #108<br />
                                Jacksonville, FL 32208
                            </p>
                        </div>

                        {/* QR Code & Label */}
                        <div className="w-[] flex flex-col items-center rotate-90">
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
                            {/* <div className="text-[6px] text-center">
                                <div>Batch#: {batchNumber}</div>
                                <div>THCA: {thcaMgPerGram ? `${thcaMgPerGram} mg/g` : "N/A"}</div>
                                <div>Exp: {getExpirationDate()}</div>
                            </div> */}
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
