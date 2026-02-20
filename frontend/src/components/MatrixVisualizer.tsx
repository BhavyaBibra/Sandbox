import React from 'react';
import { AnimatePresence } from 'framer-motion';
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

const MatrixVisualizer: React.FC<MatrixVisualizerProps> = ({ name, data, pointers = {} }) => {
    if (!data || data.length === 0) return null;

    const rows = data.length;
    const cols = data[0].length;

    const totalWidth = cols * CELL_SIZE + (cols - 1) * GAP + PADDING_LEFT + 40;
    const totalHeight = rows * CELL_SIZE + (rows - 1) * GAP + PADDING_TOP + 40;

    // Identify pointers relevant to rows (i, row) and cols (j, col)
    const rowPointers = Object.entries(pointers).filter(([k]) =>
        ['i', 'row', 'r', 'start', 'end', 'low', 'high'].includes(k.toLowerCase())
    );
    const colPointers = Object.entries(pointers).filter(([k]) =>
        ['j', 'col', 'c', 'mid', 'left', 'right'].includes(k.toLowerCase())
    );

    return (
        <div className="flex flex-col items-center mb-8">
            <h3 className="text-text-secondary text-sm font-mono mb-2 flex items-center gap-2 self-start ml-4">
                <span className="text-accent-primary font-bold">{name}</span>
                <span className="text-xs bg-bg-secondary px-1.5 rounded text-text-secondary border border-border-default">
                    Matrix[{rows}x{cols}]
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

                        {/* Row Pointers (Left Side) */}
                        {rowPointers.map(([label, idx]) => {
                            if (idx < 0 || idx >= rows) return null;
                            const yPos = idx * (CELL_SIZE + GAP) + CELL_SIZE / 2;
                            return (
                                <g key={`ptr-row-${label}`} transform={`translate(-35, ${yPos})`}>
                                    <text
                                        fill="#7AA2F7"
                                        textAnchor="end"
                                        dy=".3em"
                                        fontSize="14"
                                        fontWeight="bold"
                                        fontFamily="monospace"
                                    >
                                        {label} →
                                    </text>
                                </g>
                            );
                        })}

                        {/* Col Pointers (Top Side) */}
                        {colPointers.map(([label, idx]) => {
                            if (idx < 0 || idx >= cols) return null;
                            const xPos = idx * (CELL_SIZE + GAP) + CELL_SIZE / 2;
                            return (
                                <g key={`ptr-col-${label}`} transform={`translate(${xPos}, -30)`}>
                                    <text
                                        fill="#F472B6"
                                        textAnchor="middle"
                                        fontSize="14"
                                        fontWeight="bold"
                                        fontFamily="monospace"
                                    >
                                        {label}
                                    </text>
                                    <text
                                        y={10}
                                        fill="#F472B6"
                                        textAnchor="middle"
                                        fontSize="14"
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
