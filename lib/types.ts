import type { DraggableSyntheticListeners } from "@dnd-kit/core";

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
