import React from 'react';

interface HeatmapOverlayProps {
    /** Map of index → access count */
    heatData: Map<number, number>;
    /** Number of cells (array length) */
    cellCount: number;
    /** Cell size for positioning */
    cellSize: number;
    /** Gap between cells */
    gap: number;
    /** Maximum accesses (for normalizing intensity) */
    maxAccesses?: number;
    /** Whether the heatmap is for a horizontal (array) or vertical layout */
    direction?: 'horizontal' | 'vertical';
}

function heatColor(intensity: number): string {
    // 0 → transparent, 0.5 → warm amber, 1.0 → hot red
    if (intensity <= 0) return 'rgba(0,0,0,0)';
    if (intensity < 0.33) return `rgba(251,191,36,${intensity * 0.6})`; // amber
    if (intensity < 0.66) return `rgba(245,158,11,${intensity * 0.7})`; // orange
    return `rgba(239,68,68,${Math.min(intensity * 0.7, 0.6)})`; // red
}

const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({
    heatData,
    cellCount,
    cellSize,
    gap,
    maxAccesses,
    direction = 'horizontal',
}) => {
    if (heatData.size === 0) return null;

    // Compute max for normalization
    let max = maxAccesses || 0;
    if (!max) {
        for (const count of heatData.values()) {
            if (count > max) max = count;
        }
    }
    if (max === 0) return null;

    const rects: React.ReactNode[] = [];

    for (let i = 0; i < cellCount; i++) {
        const count = heatData.get(i) || 0;
        if (count === 0) continue;

        const intensity = count / max;
        const xPos = direction === 'horizontal' ? i * (cellSize + gap) : 0;
        const yPos = direction === 'horizontal' ? 0 : i * (cellSize + gap);

        rects.push(
            <rect
                key={`heat-${i}`}
                x={xPos}
                y={yPos}
                width={cellSize}
                height={cellSize}
                rx={direction === 'horizontal' ? cellSize / 2 : 4}
                fill={heatColor(intensity)}
                style={{ pointerEvents: 'none' }}
            />
        );
    }

    return <g className="heatmap-overlay">{rects}</g>;
};

export default HeatmapOverlay;
