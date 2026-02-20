import React from 'react';
import { motion } from 'framer-motion';
import { POINTER_TRANSITION } from '../constants/animations';

interface PointerProps {
    index: number;
    label: string;
    color?: string;
    nodeSize: number;
    gap: number;
    tier?: number; // 0 = top (closest to array), 1 = next row up, etc.
}

const CHAR_WIDTH = 8; // approximate width per character in monospace 11px
const PILL_PADDING = 12; // horizontal padding in the pill
const PILL_HEIGHT = 20;
const ARROW_HEIGHT = 10;
const TIER_SPACING = 32; // vertical space between stacked pointer tiers

const PointerRenderer: React.FC<PointerProps> = ({ index, label, color = '#7AA2F7', nodeSize, gap, tier = 0 }) => {
    const xPos = index * (nodeSize + gap) + nodeSize / 2;

    // Dynamic pill width based on label length
    const labelWidth = Math.max(label.length * CHAR_WIDTH, 14);
    const pillWidth = labelWidth + PILL_PADDING;
    const halfPill = pillWidth / 2;

    // Y offset: tier 0 is closest to the array, higher tiers are further above
    const tierOffset = tier * TIER_SPACING;

    // Pill top Y (relative to the arrow tip at y=0)
    const pillY = -(ARROW_HEIGHT + PILL_HEIGHT + tierOffset);
    // Arrow stem connects pill bottom to the arrow tip
    const stemStartY = pillY + PILL_HEIGHT;
    const stemEndY = -ARROW_HEIGHT;

    return (
        <motion.g
            layout
            initial={{ x: xPos, opacity: 0, y: -15 }}
            animate={{ x: xPos, opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={POINTER_TRANSITION}
        >
            {/* Arrow tip pointing down to (0, 0) */}
            <path
                d="M -5 -8 L 5 -8 L 0 0 Z"
                fill={color}
            />

            {/* Stem line from pill to arrow (for higher tiers) */}
            {tier > 0 && (
                <line
                    x1={0}
                    y1={stemStartY}
                    x2={0}
                    y2={stemEndY}
                    stroke={color}
                    strokeWidth={1.5}
                    strokeDasharray="3 2"
                    opacity={0.6}
                />
            )}

            {/* Label Pill — dynamically sized */}
            <rect
                x={-halfPill}
                y={pillY}
                width={pillWidth}
                height={PILL_HEIGHT}
                rx={5}
                fill={color}
                opacity={0.15}
            />
            <rect
                x={-halfPill}
                y={pillY}
                width={pillWidth}
                height={PILL_HEIGHT}
                rx={5}
                stroke={color}
                strokeWidth={1}
                fill="none"
                opacity={0.6}
            />

            {/* Label Text — always centered in pill */}
            <text
                x={0}
                y={pillY + PILL_HEIGHT / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={color}
                fontSize={11}
                fontWeight="bold"
                fontFamily="'JetBrains Mono', monospace"
            >
                {label}
            </text>
        </motion.g>
    );
};

export default PointerRenderer;
