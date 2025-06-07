// components/label/IndividualLabelPreview.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { QRCode } from "react-qrcode-logo";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";

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
const LABEL_WIDTH_PX = (3.85) * INCH_TO_PX;
const LABEL_HEIGHT_PX = (0.85) * INCH_TO_PX;

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
                className="flex flex-row items-center justify-between bg-white p-2 border rounded shadow-sm text-black"
                style={{ width: LABEL_WIDTH_PX, height: LABEL_HEIGHT_PX }}
            >
                {/* 1) Logo */}
                <div className="flex-shrink-0">
                    <img src={logoSrc} alt="Logo" className="h-auto w-16 rounded-lg" />
                </div>

                {/* 2) Center content */}
                <div className="w-full px-2 text-center">
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
                <div className="flex-shrink-0">
                    <QRCode
                        value={qrValue}
                        size={60}
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
            </Card>
        );
    }
);

IndividualLabelPreview.displayName = "IndividualLabelPreview";