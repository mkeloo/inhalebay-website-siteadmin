// components/sheet/SheetPreview.tsx
import React, { useRef } from "react";
import {
    DndContext,
    DragEndEvent,
    useSensor,
    useSensors,
    PointerSensor,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { IndividualLabelPreview } from "../LabelMaker/individualLabelPreview";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import templateImg from "@/assets/hempLabelMaker/OL75.png";

export type LabelPlacement = {
    id: string;
    slotIndex: number; // 0–19
};

export interface SheetPreviewProps {
    placements: LabelPlacement[];
    numLabels?: number;          // optional, for future use
    productName: string;
    weight: string;
    qrValue: string;
    logoSrc: string;
    warningText: string;
    onReorder: (newPlacements: LabelPlacement[]) => void;
}

export function SheetPreview({
    placements,
    numLabels,        // still in the signature
    productName,
    weight,
    qrValue,
    logoSrc,
    warningText,
    onReorder,
}: SheetPreviewProps) {
    // 4"×1" at 96px/in
    const cellW = 4 * 96;
    const cellH = 1 * 96;
    const sheetWidth = cellW * 2;
    const sheetHeight = cellH * 10;

    const sheetRef = useRef<HTMLDivElement>(null);

    // DnD setup
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && String(over.id).startsWith("slot-")) {
            const newSlot = Number(String(over.id).replace("slot-", ""));
            onReorder(
                placements.map((p) =>
                    p.id === active.id ? { ...p, slotIndex: newSlot } : p
                )
            );
        }
    }

    // Export buttons
    async function downloadPDF() {
        if (!sheetRef.current) return;
        const dataUrl = await toPng(sheetRef.current);
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [sheetWidth, sheetHeight],
            });
            pdf.addImage(img, "PNG", 0, 0, sheetWidth, sheetHeight);
            pdf.save("label-sheet.pdf");
        };
    }

    async function downloadImage() {
        if (!sheetRef.current) return;
        const dataUrl = await toPng(sheetRef.current);
        const link = document.createElement("a");
        link.download = "label-sheet.png";
        link.href = dataUrl;
        link.click();
    }

    return (
        <div className="space-y-4">
            {/* export controls */}
            <div className="flex gap-2 justify-center">
                <Button onClick={downloadPDF}>Download Sheet as PDF</Button>
                <Button variant="secondary" onClick={downloadImage}>
                    Download Sheet as Image
                </Button>
            </div>

            {/* sheet + drag/drop */}
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div
                    ref={sheetRef}
                    className="relative mx-auto"
                    style={{
                        width: sheetWidth,
                        height: sheetHeight,
                        backgroundImage: `url(${templateImg.src})`,
                        backgroundSize: "100% 100%",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    {Array.from({ length: 20 }).map((_, slotIndex) => {
                        const slotId = `slot-${slotIndex}`;
                        const { setNodeRef } = useDroppable({ id: slotId });
                        const placed = placements.find((p) => p.slotIndex === slotIndex);
                        // absolute coords on the template
                        const left = (slotIndex % 2) * cellW;
                        const top = Math.floor(slotIndex / 2) * cellH;

                        return (
                            <div
                                key={slotId}
                                ref={setNodeRef}
                                id={slotId}
                                className="absolute"
                                style={{
                                    left,
                                    top,
                                    width: cellW,
                                    height: cellH,
                                }}
                            >
                                {placed && (
                                    <DraggableLabel id={placed.id}>
                                        <IndividualLabelPreview
                                            id={placed.id}
                                            productName={productName}
                                            weight={weight}
                                            qrValue={qrValue}
                                            logoSrc={logoSrc}
                                            warningText={warningText}
                                        />
                                    </DraggableLabel>
                                )}
                            </div>
                        );
                    })}
                </div>
            </DndContext>
        </div>
    );
}

interface DraggableLabelProps {
    id: string;
    children: React.ReactNode;
}
function DraggableLabel({ id, children }: DraggableLabelProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id });
    const style = transform
        ? {
            transform: `translate3d(${transform.x}px,${transform.y}px,0)`,
            zIndex: isDragging ? 10 : 0,
        }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className="w-full h-full"
        >
            {children}
        </div>
    );
}