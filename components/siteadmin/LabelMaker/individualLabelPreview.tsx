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
const LABEL_WIDTH_PX = 4 * INCH_TO_PX;
const LABEL_HEIGHT_PX = 1 * INCH_TO_PX;

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
                    <img src={logoSrc} alt="Logo" className="h-8 w-auto" />
                </div>

                {/* 2) Center content */}
                <div className="flex-1 px-2 text-center">
                    <h4 className="font-bold text-sm leading-tight text-black">{productName}</h4>
                    <p className="text-xs leading-snug text-black">{weight}</p>
                    <p className="text-[8px] mt-1 leading-snug text-black">{warningText}</p>
                </div>

                {/* 3) QR */}
                <div className="flex-shrink-0">
                    <QRCode value={qrValue} size={64} quietZone={4} fgColor="#000" bgColor="#FFF" />
                </div>
            </Card>
        );
    }
);

IndividualLabelPreview.displayName = "IndividualLabelPreview";