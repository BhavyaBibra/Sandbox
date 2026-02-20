import { AnimatePresence } from 'framer-motion';
import PointerRenderer from './PointerRenderer';
import ArrayNode from './ArrayNode';

interface ArrayVisualizerProps {
    name: string;
    data: any[];
    pointers?: { [key: string]: number };
}

const NODE_SIZE = 50; // Diameter
const GAP = 16;
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
    // Sort by index, then alphabetically for deterministic ordering
    entries.sort((a, b) => a.index - b.index || a.label.localeCompare(b.label));

    const result: { label: string; index: number; tier: number }[] = [];
    // Group by index: pointers at same index get ascending tiers
    const indexCountMap = new Map<number, number>();
    for (const entry of entries) {
        const tier = indexCountMap.get(entry.index) || 0;
        result.push({ ...entry, tier });
        indexCountMap.set(entry.index, tier + 1);
    }
    return result;
};

const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({ name, data, pointers = {} }) => {
    // Compute tiers for overlapping pointers
    const tieredPointers = computePointerTiers(pointers);
    const maxTier = tieredPointers.reduce((max, p) => Math.max(max, p.tier), 0);
    const PADDING_TOP = BASE_PADDING_TOP + maxTier * TIER_SPACING;

    // Calculate total SVG dimensions
    const totalWidth = data.length * NODE_SIZE + (data.length - 1) * GAP + PADDING_X * 2;
    const totalHeight = NODE_SIZE + PADDING_TOP + PADDING_BOTTOM;

    // Helper to get color for a pointer
    const getPointerColor = (label: string): string => {
        if (['i', 'left', 'low', 'start'].includes(label)) return '#7AA2F7'; // Blue
        if (['j', 'right', 'high', 'end'].includes(label)) return '#F472B6'; // Pink/Rose
        if (['mid', 'k'].includes(label)) return '#E0AF68'; // Orange/Warning
        return '#9ECE6A'; // Green/Success default
    };

    return (
        <div className="flex flex-col items-center mb-8">
            <h3 className="text-text-secondary text-sm font-mono mb-2 flex items-center gap-2 self-start ml-4">
                <span className="text-accent-primary font-bold">{name}</span>
                <span className="text-xs bg-bg-secondary px-1.5 rounded text-text-secondary border border-border-default">
                    List[{data.length}]
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
                            {data.map((value, idx) => {
                                const xPos = idx * (NODE_SIZE + GAP);

                                return (
                                    <ArrayNode
                                        key={idx}
                                        value={value}
                                        index={idx}
                                        xPos={xPos}
                                        yPos={0}
                                        size={NODE_SIZE}
                                    />
                                );
                            })}
                        </AnimatePresence>

                        {/* Pointers Layer — with tier-based stacking */}
                        <AnimatePresence>
                            {tieredPointers.map(({ label, index, tier }) => (
                                <PointerRenderer
                                    key={label}
                                    index={index}
                                    label={label}
                                    color={getPointerColor(label)}
                                    nodeSize={NODE_SIZE}
                                    gap={GAP}
                                    tier={tier}
                                />
                            ))}
                        </AnimatePresence>
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default ArrayVisualizer;
