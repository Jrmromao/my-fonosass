import {FormField} from "@/types/types";
import {useMemo} from "react";

interface GuideLineProps {
    position: number;
    type: 'vertical' | 'horizontal';
}

const GuideLine: React.FC<GuideLineProps> = ({ position, type }) => (
    <div
        className="absolute bg-blue-500 pointer-events-none z-50"
        style={{
            ...(type === 'vertical' ? {
                left: `${position}px`,
                width: '1px',
                top: 0,
                bottom: 0,
            } : {
                top: `${position}px`,
                height: '1px',
                left: 0,
                right: 0,
            })
        }}
    />
);

interface AlignmentGuidesProps {
    activeField: FormField;
    otherFields: FormField[];
    threshold?: number;
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
                                                             activeField,
                                                             otherFields,
                                                             threshold = 5
                                                         }) => {
    const guides = useAlignmentGuides(activeField, otherFields, threshold);

    return (
        <>
            {guides.vertical.map((position) => (
                <GuideLine key={`v-${position}`} position={position} type="vertical" />
            ))}
            {guides.horizontal.map((position) => (
                <GuideLine key={`h-${position}`} position={position} type="horizontal" />
            ))}
        </>
    );
};

// hooks/useAlignmentGuides.ts
interface GuidePositions {
    vertical: number[];
    horizontal: number[];
}

const useAlignmentGuides = (
    activeField: FormField,
    otherFields: FormField[],
    threshold: number
): GuidePositions => {
    return useMemo(() => {
        const guides: GuidePositions = {
            vertical: [],
            horizontal: []
        };

        // Helper function to check if values are within threshold
        const isNear = (value1: number, value2: number): boolean => {
            return Math.abs(value1 - value2) <= threshold;
        };

        otherFields.forEach(field => {
            // Skip the active field
            if (field.id === activeField.id) return;

            // Vertical alignments
            if (isNear(activeField.x, field.x)) {
                guides.vertical.push(field.x); // Left edges align
            }
            if (isNear(activeField.x + activeField.width, field.x + field.width)) {
                guides.vertical.push(field.x + field.width); // Right edges align
            }
            if (isNear(activeField.x, field.x + field.width)) {
                guides.vertical.push(field.x + field.width); // Left edge to right edge
            }
            if (isNear(activeField.x + activeField.width, field.x)) {
                guides.vertical.push(field.x); // Right edge to left edge
            }
            // Center alignment
            const activeCenterX = activeField.x + activeField.width / 2;
            const fieldCenterX = field.x + field.width / 2;
            if (isNear(activeCenterX, fieldCenterX)) {
                guides.vertical.push(fieldCenterX);
            }

            // Horizontal alignments
            if (isNear(activeField.y, field.y)) {
                guides.horizontal.push(field.y); // Top edges align
            }
            if (isNear(activeField.y + activeField.height, field.y + field.height)) {
                guides.horizontal.push(field.y + field.height); // Bottom edges align
            }
            if (isNear(activeField.y, field.y + field.height)) {
                guides.horizontal.push(field.y + field.height); // Top edge to bottom edge
            }
            if (isNear(activeField.y + activeField.height, field.y)) {
                guides.horizontal.push(field.y); // Bottom edge to top edge
            }
            // Center alignment
            const activeCenterY = activeField.y + activeField.height / 2;
            const fieldCenterY = field.y + field.height / 2;
            if (isNear(activeCenterY, fieldCenterY)) {
                guides.horizontal.push(fieldCenterY);
            }
        });

        // Remove duplicates
        return {
            vertical: Array.from(new Set(guides.vertical)),
            horizontal: Array.from(new Set(guides.horizontal))
        };
    }, [activeField, otherFields, threshold]);
};