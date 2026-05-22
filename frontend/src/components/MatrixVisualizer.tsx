import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ArrayNode from './ArrayNode';

interface MatrixVisualizerProps {
    name: string;
    data: any[][];
    pointers?: { [key: string]: number };
}

const CELL_SIZE = 50;
const GAP = 8;
const PADDING_LEFT = 60; // Space for Row Indices & Pointers
const PADDING_TOP = 60;  // Space for Col Indices & Pointers

// Expanded row/col pointer detection for common LeetCode patterns
const ROW_POINTER_NAMES = new Set(['i', 'row', 'r', 'nr', 'start', 'end', 'low', 'high', 'top', 'bottom', 'lo', 'hi']);
const COL_POINTER_NAMES = new Set(['j', 'col', 'c', 'nc', 'mid', 'left', 'right', 'l']);

const getPointerColor = (label: string): string => {
    if (['i', 'r', 'row', 'nr', 'start', 'low', 'lo', 'top'].includes(label)) return '#7AA2F7';
    if (['j', 'c', 'col', 'nc', 'end', 'high', 'hi', 'right', 'bottom'].includes(label)) return '#F472B6';
    if (['mid', 'k'].includes(label)) return '#E0AF68';
    return '#9ECE6A';
};

const MatrixVisualizer: React.FC<MatrixVisualizerProps> = ({ name, data, pointers = {} }) => {
    if (!data || data.length === 0) return null;

    const rows = data.length;
    const cols = data[0].length;

    const totalWidth = cols * CELL_SIZE + (cols - 1) * GAP + PADDING_LEFT + 40;
    const totalHeight = rows * CELL_SIZE + (rows - 1) * GAP + PADDING_TOP + 40;

    // Identify pointers relevant to rows and cols
    const rowPointers = Object.entries(pointers).filter(([k]) => ROW_POINTER_NAMES.has(k.toLowerCase()));
    const colPointers = Object.entries(pointers).filter(([k]) => COL_POINTER_NAMES.has(k.toLowerCase()));

    // Compute active cell(s) — intersection of row and col pointers
    const activeCells = new Set<string>();
    for (const [, rIdx] of rowPointers) {
        for (const [, cIdx] of colPointers) {
            if (rIdx >= 0 && rIdx < rows && cIdx >= 0 && cIdx < cols) {
                activeCells.add(`${rIdx}-${cIdx}`);
            }
        }
    }

    return (
        <div className="flex flex-col items-center mb-8">
            <h3 className="text-text-secondary text-sm font-mono mb-2 flex items-center gap-2 self-start ml-4">
                <span className="text-accent-primary font-bold">{name}</span>
                <span className="text-xs bg-bg-secondary px-1.5 rounded text-text-secondary border border-border-default">
                    Matrix[{rows}×{cols}]
                </span>
            </h3>

            <div className="overflow-x-auto w-full flex justify-center">
                <svg
                    width={Math.max(totalWidth, 200)}
                    height={totalHeight}
                    className="overflow-visible"
                    style={{ minWidth: totalWidth }}
                >
                    <g transform={`translate(${PADDING_LEFT}, ${PADDING_TOP})`}>
                        {/* Column Indices */}
                        {Array.from({ length: cols }).map((_, c) => (
                            <text
                                key={`col-idx-${c}`}
                                x={c * (CELL_SIZE + GAP) + CELL_SIZE / 2}
                                y={-10}
                                textAnchor="middle"
                                fill="#6B7280"
                                fontSize="12"
                                fontFamily="monospace"
                            >
                                {c}
                            </text>
                        ))}

                        {/* Row Indices */}
                        {Array.from({ length: rows }).map((_, r) => (
                            <text
                                key={`row-idx-${r}`}
                                x={-15}
                                y={r * (CELL_SIZE + GAP) + CELL_SIZE / 2}
                                dy=".3em"
                                textAnchor="end"
                                fill="#6B7280"
                                fontSize="12"
                                fontFamily="monospace"
                            >
                                {r}
                            </text>
                        ))}

                        {/* Active Cell Highlight (rendered BEHIND cells for glow effect) */}
                        <AnimatePresence>
                            {Array.from(activeCells).map((key) => {
                                const [r, c] = key.split('-').map(Number);
                                const xPos = c * (CELL_SIZE + GAP);
                                const yPos = r * (CELL_SIZE + GAP);
                                return (
                                    <motion.rect
                                        key={`active-${key}`}
                                        x={xPos - 4}
                                        y={yPos - 4}
                                        width={CELL_SIZE + 8}
                                        height={CELL_SIZE + 8}
                                        rx={8}
                                        fill="none"
                                        stroke="#7AA2F7"
                                        strokeWidth={2.5}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <animate
                                            attributeName="stroke-opacity"
                                            values="1;0.4;1"
                                            dur="1.5s"
                                            repeatCount="indefinite"
                                        />
                                    </motion.rect>
                                );
                            })}
                        </AnimatePresence>

                        {/* Matrix Cells */}
                        <AnimatePresence>
                            {data.map((row, r) =>
                                row.map((value, c) => {
                                    const xPos = c * (CELL_SIZE + GAP);
                                    const yPos = r * (CELL_SIZE + GAP);

                                    return (
                                        <ArrayNode
                                            key={`${r}-${c}`}
                                            value={value}
                                            xPos={xPos}
                                            yPos={yPos}
                                            size={CELL_SIZE}
                                            shape="square"
                                            showIndex={false}
                                        />
                                    );
                                })
                            )}
                        </AnimatePresence>

                        {/* Row Pointers (Left Side) — with stacking for multiple */}
                        {rowPointers.map(([label, idx], ptrIdx) => {
                            if (idx < 0 || idx >= rows) return null;
                            const yPos = idx * (CELL_SIZE + GAP) + CELL_SIZE / 2;
                            const xOffset = -35 - (ptrIdx > 0 ? ptrIdx * 50 : 0);
                            const color = getPointerColor(label);
                            return (
                                <g key={`ptr-row-${label}`} transform={`translate(${xOffset}, ${yPos})`}>
                                    <text
                                        fill={color}
                                        textAnchor="end"
                                        dy=".3em"
                                        fontSize="13"
                                        fontWeight="bold"
                                        fontFamily="'JetBrains Mono', monospace"
                                    >
                                        {label} →
                                    </text>
                                </g>
                            );
                        })}

                        {/* Col Pointers (Top Side) — with stacking for multiple */}
                        {colPointers.map(([label, idx], ptrIdx) => {
                            if (idx < 0 || idx >= cols) return null;
                            const xPos = idx * (CELL_SIZE + GAP) + CELL_SIZE / 2;
                            const yOffset = -30 - (ptrIdx > 0 ? ptrIdx * 22 : 0);
                            const color = getPointerColor(label);
                            return (
                                <g key={`ptr-col-${label}`} transform={`translate(${xPos}, ${yOffset})`}>
                                    <text
                                        fill={color}
                                        textAnchor="middle"
                                        fontSize="13"
                                        fontWeight="bold"
                                        fontFamily="'JetBrains Mono', monospace"
                                    >
                                        {label}
                                    </text>
                                    <text
                                        y={12}
                                        fill={color}
                                        textAnchor="middle"
                                        fontSize="13"
                                        fontWeight="bold"
                                    >
                                        ↓
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default MatrixVisualizer;
