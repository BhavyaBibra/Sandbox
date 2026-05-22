import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BoardVisualizerProps {
    name: string;
    data: any[][];
    pointers?: { [key: string]: number };
}

const CELL_SIZE = 52;
const GAP = 2;
const PADDING_LEFT = 30;
const PADDING_TOP = 30;

// Semantic cell rendering based on value
function getCellStyle(value: any): { bg: string; text: string; icon: string | null; textColor: string } {
    const strVal = String(value);

    // Queen
    if (strVal === 'Q') {
        return { bg: 'rgba(244,114,182,0.2)', text: '♛', icon: null, textColor: '#F472B6' };
    }
    // Empty in queen-style boards
    if (strVal === '.') {
        return { bg: 'rgba(139,148,158,0.03)', text: '·', icon: null, textColor: '#4B5563' };
    }
    // True/visited
    if (strVal === 'true' || strVal === 'True') {
        return { bg: 'rgba(158,206,106,0.15)', text: '✓', icon: null, textColor: '#9ECE6A' };
    }
    // False/unvisited
    if (strVal === 'false' || strVal === 'False') {
        return { bg: 'rgba(139,148,158,0.03)', text: '', icon: null, textColor: '#6B7280' };
    }
    // Zero
    if (strVal === '0' || strVal === 'None') {
        return { bg: 'rgba(139,148,158,0.03)', text: strVal === 'None' ? '' : '0', icon: null, textColor: '#4B5563' };
    }
    // Sudoku digits (1-9)
    if (/^[1-9]$/.test(strVal)) {
        return { bg: 'rgba(122,162,247,0.08)', text: strVal, icon: null, textColor: '#C8D3F5' };
    }
    // 1 (generic placed)
    if (strVal === '1') {
        return { bg: 'rgba(158,206,106,0.12)', text: '●', icon: null, textColor: '#9ECE6A' };
    }
    // Default
    return { bg: 'rgba(139,148,158,0.04)', text: strVal.slice(0, 3), icon: null, textColor: '#8B949E' };
}

// Row/col pointer names for board problems
const ROW_NAMES = new Set(['i', 'row', 'r', 'nr']);
const COL_NAMES = new Set(['j', 'col', 'c', 'nc']);

const BoardVisualizer: React.FC<BoardVisualizerProps> = ({ name, data, pointers = {} }) => {
    if (!data || data.length === 0) return null;

    const rows = data.length;
    const cols = data[0].length;
    const totalWidth = cols * (CELL_SIZE + GAP) + PADDING_LEFT + 20;
    const totalHeight = rows * (CELL_SIZE + GAP) + PADDING_TOP + 20;

    const rowPointers = Object.entries(pointers).filter(([k]) => ROW_NAMES.has(k.toLowerCase()));
    const colPointers = Object.entries(pointers).filter(([k]) => COL_NAMES.has(k.toLowerCase()));

    // Active cells from pointer intersection
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
                <span className="text-amber-400 font-bold">{name}</span>
                <span className="text-xs bg-bg-secondary px-1.5 rounded text-text-secondary border border-border-default">
                    Board[{rows}×{cols}]
                </span>
            </h3>

            <div className="overflow-x-auto w-full flex justify-center">
                <svg
                    width={Math.max(totalWidth, 200)}
                    height={totalHeight}
                    className="overflow-visible"
                >
                    <g transform={`translate(${PADDING_LEFT}, ${PADDING_TOP})`}>
                        {/* Checkerboard background */}
                        {data.map((row, r) =>
                            row.map((_, c) => (
                                <rect
                                    key={`bg-${r}-${c}`}
                                    x={c * (CELL_SIZE + GAP)}
                                    y={r * (CELL_SIZE + GAP)}
                                    width={CELL_SIZE}
                                    height={CELL_SIZE}
                                    rx={3}
                                    fill={(r + c) % 2 === 0 ? 'rgba(59,63,81,0.25)' : 'rgba(59,63,81,0.12)'}
                                />
                            ))
                        )}

                        {/* Active cell highlight */}
                        <AnimatePresence>
                            {Array.from(activeCells).map(key => {
                                const [r, c] = key.split('-').map(Number);
                                return (
                                    <motion.rect
                                        key={`active-${key}`}
                                        x={c * (CELL_SIZE + GAP) - 3}
                                        y={r * (CELL_SIZE + GAP) - 3}
                                        width={CELL_SIZE + 6}
                                        height={CELL_SIZE + 6}
                                        rx={5}
                                        fill="none"
                                        stroke="#7AA2F7"
                                        strokeWidth={2.5}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <animate
                                            attributeName="stroke-opacity"
                                            values="1;0.3;1"
                                            dur="1.5s"
                                            repeatCount="indefinite"
                                        />
                                    </motion.rect>
                                );
                            })}
                        </AnimatePresence>

                        {/* Cell values */}
                        <AnimatePresence>
                            {data.map((row, r) =>
                                row.map((value, c) => {
                                    const style = getCellStyle(value);
                                    const xPos = c * (CELL_SIZE + GAP);
                                    const yPos = r * (CELL_SIZE + GAP);

                                    return (
                                        <motion.g
                                            key={`cell-${r}-${c}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            {/* Semantic fill */}
                                            <rect
                                                x={xPos + 1}
                                                y={yPos + 1}
                                                width={CELL_SIZE - 2}
                                                height={CELL_SIZE - 2}
                                                rx={2}
                                                fill={style.bg}
                                            />

                                            {/* Value */}
                                            <text
                                                x={xPos + CELL_SIZE / 2}
                                                y={yPos + CELL_SIZE / 2}
                                                dy=".35em"
                                                textAnchor="middle"
                                                fill={style.textColor}
                                                fontSize={style.text === '♛' ? 22 : 16}
                                                fontWeight="600"
                                                fontFamily="'JetBrains Mono', monospace"
                                            >
                                                {style.text}
                                            </text>
                                        </motion.g>
                                    );
                                })
                            )}
                        </AnimatePresence>

                        {/* Row indices */}
                        {Array.from({ length: rows }).map((_, r) => (
                            <text
                                key={`ri-${r}`}
                                x={-12}
                                y={r * (CELL_SIZE + GAP) + CELL_SIZE / 2}
                                dy=".35em"
                                textAnchor="end"
                                fill="#6B7280"
                                fontSize={11}
                                fontFamily="monospace"
                            >
                                {r}
                            </text>
                        ))}

                        {/* Col indices */}
                        {Array.from({ length: cols }).map((_, c) => (
                            <text
                                key={`ci-${c}`}
                                x={c * (CELL_SIZE + GAP) + CELL_SIZE / 2}
                                y={-8}
                                textAnchor="middle"
                                fill="#6B7280"
                                fontSize={11}
                                fontFamily="monospace"
                            >
                                {c}
                            </text>
                        ))}
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default BoardVisualizer;
