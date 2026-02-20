import React from 'react';
import { AnimatePresence } from 'framer-motion';
import PointerRenderer from './PointerRenderer';
import ArrayNode from './ArrayNode';

export interface StringVisualizerProps {
    name: string;
    data: string; // The string itself
    pointers?: { [key: string]: number };
}

const NODE_SIZE = 40; // Slightly smaller blocks for characters
const GAP = 4;        // Tighter gap for string letters
const PADDING_X = 40;
const BASE_PADDING_TOP = 60; // Base space for pointers
const TIER_SPACING = 32; // Must match PointerRenderer
const PADDING_BOTTOM = 40; // Space for indices

/**
 * Assigns a vertical tier to each pointer so overlapping pointers at the
 * same index stack vertically instead of colliding.
 */
const computePointerTiers = (pointers: { [key: string]: number }): { label: string; index: number; tier: number }[] => {
    const entries = Object.entries(pointers).map(([label, index]) => ({ label, index }));
    entries.sort((a, b) => a.index - b.index || a.label.localeCompare(b.label));

    const result: { label: string; index: number; tier: number }[] = [];
    const indexCountMap = new Map<number, number>();
    for (const entry of entries) {
        const tier = indexCountMap.get(entry.index) || 0;
        result.push({ ...entry, tier });
        indexCountMap.set(entry.index, tier + 1);
    }
    return result;
};

const StringVisualizer: React.FC<StringVisualizerProps> = ({ name, data, pointers = {} }) => {
    // Compute tiers for overlapping pointers
    const tieredPointers = computePointerTiers(pointers);
    const maxTier = tieredPointers.reduce((max, p) => Math.max(max, p.tier), 0);
    const PADDING_TOP = BASE_PADDING_TOP + maxTier * TIER_SPACING;

    // Calculate total SVG dimensions
    const totalWidth = data.length * NODE_SIZE + Math.max(0, data.length - 1) * GAP + PADDING_X * 2;
    const totalHeight = NODE_SIZE + PADDING_TOP + PADDING_BOTTOM;

    // Helper to get color for a pointer
    const getPointerColor = (label: string): string => {
        if (['i', 'left', 'low', 'start'].includes(label)) return '#7AA2F7'; // Blue
        if (['j', 'right', 'high', 'end'].includes(label)) return '#F472B6'; // Pink/Rose
        if (['mid', 'k'].includes(label)) return '#E0AF68'; // Orange/Warning
        return '#9ECE6A'; // Green/Success default
    };

    return (
        <div className="flex flex-col items-center mb-8 w-full">
            <h3 className="text-text-secondary text-sm font-mono mb-2 flex items-center gap-2 self-start ml-4">
                <span className="text-accent-primary font-bold">{name}</span>
                <span className="text-xs bg-bg-secondary px-1.5 rounded text-text-secondary border border-border-default">
                    str[{data.length}]
                </span>
            </h3>

            <div className="overflow-x-auto w-full flex justify-center">
                <svg
                    width={Math.max(totalWidth, 100)}
                    height={totalHeight}
                    className="overflow-visible"
                    style={{ minWidth: totalWidth }}
                >
                    <g transform={`translate(${PADDING_X}, ${PADDING_TOP})`}>
                        <AnimatePresence>
                            {data.split('').map((char, idx) => {
                                const xPos = idx * (NODE_SIZE + GAP);

                                return (
                                    <ArrayNode
                                        key={idx}
                                        value={char}
                                        index={idx}
                                        xPos={xPos}
                                        yPos={0}
                                        size={NODE_SIZE}
                                        shape="square"
                                    />
                                );
                            })}
                        </AnimatePresence>

                        {/* Pointers Layer — with tier-based stacking */}
                        <AnimatePresence>
                            {tieredPointers.map(({ label, index, tier }) => {
                                const validIndex = Math.max(0, Math.min(index, data.length));
                                return (
                                    <PointerRenderer
                                        key={label}
                                        index={validIndex}
                                        label={label}
                                        color={getPointerColor(label)}
                                        nodeSize={NODE_SIZE}
                                        gap={GAP}
                                        tier={tier}
                                    />
                                );
                            })}
                        </AnimatePresence>
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default StringVisualizer;

