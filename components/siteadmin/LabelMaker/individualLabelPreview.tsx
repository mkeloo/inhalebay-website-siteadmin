// components/label/IndividualLabelPreview.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { QRCode } from "react-qrcode-logo";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import CannabisWarning from "@/assets/hempLabelMaker/CannabisWarning.webp";

export interface IndividualLabelPreviewProps {
    id: string;
    productName: string;
    weight: string;
    qrValue: string;
    logoSrc: string;
    warningText: string;
    listeners?: DraggableSyntheticListeners;
    attributes?: React.HTMLAttributes<HTMLDivElement>;
}

const INCH_TO_PX = 96;
const LABEL_WIDTH_PX = (3) * INCH_TO_PX;
const LABEL_HEIGHT_PX = (1) * INCH_TO_PX;

export const IndividualLabelPreview = React.forwardRef<
    HTMLDivElement,
    IndividualLabelPreviewProps
>(
    (
        {
            id,
            productName,
            weight,
            qrValue,
            logoSrc,
            warningText,
            listeners,
            attributes,
        },
        ref
    ) => {
        // Split productName so any "THCA…" part wraps to the next line
        const match = productName.match(/(.*?)(THCA.*)/i);
        const firstLine = match ? match[1].trim() : productName;
        const secondLine = match ? match[2].trim() : "";

        return (
            <Card
                ref={ref}
                id={id}
                {...attributes}
                {...listeners}
                className="flex flex-row items-center justify-between bg-white p-0 rounded shadow-sm text-black gap-2"
                style={{ width: LABEL_WIDTH_PX, height: LABEL_HEIGHT_PX }}
            >
                <div className="w-20 h-full flex flex-col items-center justify-between px-1">
                    <div className="flex flex-col items-center justify-center h-full">
                        {/* 1) Logo */}
                        <div className="flex-shrink-0 w-[60px] h-auto px-1.5">
                            <img
                                src={logoSrc}
                                alt="Logo"
                                className="h-auto w-full rounded-lg border border-black p-1"
                            />
                        </div>

                        <p className="text-[8px] mt-[2px] leading-tight text-black">
                            <span className="font-bold font-mono">Inhale Bay</span>
                            <br />
                            {/* <span className="font-bold font-mono">Smoke Shop</span> */}
                            {/* <br /> */}
                            {/* Website as plain text */}
                            <span className="text-[6px] font-mono">inhalebaysmokeshop.com</span>
                        </p>
                    </div>
                </div>

                {/* 2) Center content */}
                <div className="w-full px-2 text-center relative">


                    {/* 21+ Label */}
                    {/* <div className="absolute -top-5 right-1 flex justify-center mt-1">
                        <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center">
                            <span className="text-[7px] font-bold tracking-tighter">21+</span>
                        </div>
                    </div> */}


                    <h4 className="font-bold text-sm leading-tight text-black">
                        {firstLine}
                        <span className="text-xs font-medium">
                            {secondLine && <><br />{secondLine}</>}
                            <span className="text-xs leading-snug text-black mx-2">{weight}</span>
                        </span>
                    </h4>

                    <p className="text-[8px] mt-1 leading-tight text-black">
                        {warningText}
                    </p>
                </div>

                {/* 3) QR */}
                <div className="h-full w-auto flex flex-col items-center justify-between px-1 pb-1">
                    {/* 21+ Label */}
                    <div className="flex justify-center mt-1">
                        {/* <span className="text-[7px] font-bold text-black mx-2 py-1.5">{weight}</span> */}


                        <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center">
                            <span className="text-[7px] font-bold tracking-tighter">21+</span>
                        </div>
                    </div>


                    <p className="text-[8px] mb-[0.5px] leading-tight text-black">
                        <span className="text-[8px]">Lab Report</span>
                    </p>


                    {/* QR Code */}
                    <div className="flex-shrink-0">
                        <QRCode
                            value={qrValue}
                            size={400}            // generate high-res SVG
                            ecLevel="H"
                            qrStyle="squares"     // square modules for reliability
                            fgColor="#000000"
                            bgColor="#FFFFFF"
                            quietZone={8}         // larger white border
                            eyeRadius={[
                                { outer: 12, inner: 4 },
                                { outer: 12, inner: 4 },
                                { outer: 12, inner: 4 },
                            ]}
                            style={{
                                width: "0.50in",    // ~0.50" square on paper
                                height: "0.50in",
                            }}
                        />
                    </div>



                </div>
            </Card>
        );
    }
);

IndividualLabelPreview.displayName = "IndividualLabelPreview";