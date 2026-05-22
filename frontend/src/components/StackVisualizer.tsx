import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface StackVisualizerProps {
    name: string;
    data: any[];
}

const CELL_WIDTH = 80;
const CELL_HEIGHT = 40;
const GAP = 4;
const PADDING = 20;

const StackVisualizer: React.FC<StackVisualizerProps> = ({ name, data }) => {
    // Render top-of-stack first (reversed so visual top = array end)
    const reversed = [...data].reverse();
    const stackHeight = reversed.length * (CELL_HEIGHT + GAP) - GAP;
    const totalWidth = CELL_WIDTH + PADDING * 2 + 60; // Extra for labels
    const totalHeight = Math.max(stackHeight + PADDING * 2 + 40, 100);

    return (
        <div className="flex flex-col items-center mb-8">
            <h3 className="text-text-secondary text-sm font-mono mb-2 flex items-center gap-2 self-start ml-4">
                <span className="text-accent-primary font-bold">{name}</span>
                <span className="text-xs bg-bg-secondary px-1.5 rounded text-text-secondary border border-border-default">
                    Stack[{data.length}]
                </span>
            </h3>

            <div className="overflow-y-auto w-full flex justify-center" style={{ maxHeight: 400 }}>
                <svg
                    width={totalWidth}
                    height={totalHeight}
                    className="overflow-visible"
                >
                    <g transform={`translate(${PADDING + 30}, ${PADDING})`}>
                        {/* Container border — tall vertical box */}
                        <rect
                            x={-4}
                            y={-4}
                            width={CELL_WIDTH + 8}
                            height={Math.max(stackHeight + 8, CELL_HEIGHT + 8)}
                            rx={6}
                            fill="none"
                            stroke="#3B3F51"
                            strokeWidth={1.5}
                            strokeDasharray="6 3"
                            opacity={0.5}
                        />

                        {/* "TOP" label */}
                        <text
                            x={CELL_WIDTH + 16}
                            y={CELL_HEIGHT / 2}
                            dy=".35em"
                            fill="#7AA2F7"
                            fontSize={11}
                            fontWeight="bold"
                            fontFamily="'JetBrains Mono', monospace"
                            opacity={data.length > 0 ? 1 : 0.3}
                        >
                            ← TOP
                        </text>

                        {/* Stack elements — top of stack first */}
                        <AnimatePresence mode="popLayout">
                            {reversed.map((value, visualIdx) => {
                                const isTop = visualIdx === 0;
                                const yPos = visualIdx * (CELL_HEIGHT + GAP);

                                return (
                                    <motion.g
                                        key={`${data.length}-${visualIdx}`}
                                        initial={{ opacity: 0, y: yPos - 20, scale: 0.9 }}
                                        animate={{ opacity: 1, y: yPos, scale: 1 }}
                                        exit={{ opacity: 0, y: yPos - 20, scale: 0.8 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    >
                                        {/* Cell rectangle */}
                                        <rect
                                            width={CELL_WIDTH}
                                            height={CELL_HEIGHT}
                                            rx={4}
                                            fill={isTop ? 'rgba(122, 162, 247, 0.12)' : 'rgba(139, 148, 158, 0.06)'}
                                            stroke={isTop ? '#7AA2F7' : '#3B3F51'}
                                            strokeWidth={isTop ? 2 : 1}
                                        />

                                        {/* Value text */}
                                        <text
                                            x={CELL_WIDTH / 2}
                                            y={CELL_HEIGHT / 2}
                                            dy=".35em"
                                            textAnchor="middle"
                                            fill={isTop ? '#C8D3F5' : '#8B949E'}
                                            fontSize={14}
                                            fontWeight={isTop ? '700' : '500'}
                                            fontFamily="'JetBrains Mono', monospace"
                                        >
                                            {String(value).length > 8
                                                ? String(value).slice(0, 7) + '…'
                                                : String(value)}
                                        </text>

                                        {/* Index label (original array index) */}
                                        <text
                                            x={-10}
                                            y={CELL_HEIGHT / 2}
                                            dy=".35em"
                                            textAnchor="end"
                                            fill="#6B7280"
                                            fontSize={10}
                                            fontFamily="monospace"
                                        >
                                            {data.length - 1 - visualIdx}
                                        </text>
                                    </motion.g>
                                );
                            })}
                        </AnimatePresence>

                        {/* Empty state */}
                        {data.length === 0 && (
                            <text
                                x={CELL_WIDTH / 2}
                                y={CELL_HEIGHT / 2}
                                dy=".35em"
                                textAnchor="middle"
                                fill="#6B7280"
                                fontSize={12}
                                fontFamily="monospace"
                                opacity={0.6}
                            >
                                empty
                            </text>
                        )}
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default StackVisualizer;
