import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import ArrayNode from './ArrayNode';

export interface LinkedListVisualizerProps {
    nodes: { [id: string]: { id: string, val: any, next: string | null } };
    pointers: { [key: string]: string };
}

const CELL_SIZE = 50;
const X_SPACING = 120;
const Y_SPACING = 120;
const PADDING = 40;

const LinkedListVisualizer: React.FC<LinkedListVisualizerProps> = ({ nodes, pointers }) => {
    if (Object.keys(nodes).length === 0) return null;

    const { nodePositions, totalWidth, totalHeight } = useMemo(() => {
        const visited = new Set<string>();
        const inDegree: Record<string, number> = {};

        Object.keys(nodes).forEach(id => inDegree[id] = 0);
        Object.values(nodes).forEach(node => {
            if (node.next && inDegree[node.next] !== undefined) {
                inDegree[node.next]++;
            }
        });

        // Priority 1: True heads (in-degree 0)
        // Priority 2: Nodes specifically named by a pointer
        const startNodes = [
            ...Object.keys(nodes).filter(id => inDegree[id] === 0),
            ...Object.values(pointers).filter(id => nodes[id])
        ];

        const outLists: string[][] = [];

        for (const startId of startNodes) {
            if (visited.has(startId)) continue;
            const currentList: string[] = [];
            let curr: string | null = startId;
            while (curr && nodes[curr] && !visited.has(curr)) {
                visited.add(curr);
                currentList.push(curr);
                curr = nodes[curr].next;
            }
            if (currentList.length > 0) outLists.push(currentList);
        }

        // Remaining unvisited nodes (e.g. isolated cycles without active pointers)
        for (const id of Object.keys(nodes)) {
            if (!visited.has(id)) {
                const currentList: string[] = [];
                let curr: string | null = id;
                while (curr && nodes[curr] && !visited.has(curr)) {
                    visited.add(curr);
                    currentList.push(curr);
                    curr = nodes[curr].next;
                }
                if (currentList.length > 0) outLists.push(currentList);
            }
        }

        const positions: Record<string, { x: number, y: number }> = {};
        let maxCol = 0;
        outLists.forEach((list, rowIdx) => {
            list.forEach((nodeId, colIdx) => {
                positions[nodeId] = { x: colIdx * X_SPACING, y: rowIdx * Y_SPACING };
                if (colIdx > maxCol) maxCol = colIdx;
            });
        });

        return {

            nodePositions: positions,
            totalWidth: maxCol * X_SPACING + CELL_SIZE + PADDING * 2 + 60,
            totalHeight: outLists.length * Y_SPACING + CELL_SIZE + PADDING * 2 + 40
        };
    }, [nodes, pointers]);

    const pointersByNode: Record<string, string[]> = {};
    Object.entries(pointers).forEach(([name, targetId]) => {
        if (!pointersByNode[targetId]) pointersByNode[targetId] = [];
        pointersByNode[targetId].push(name);
    });

    const renderEdge = (n: { id: string, val: any, next: string | null }) => {
        if (!n.next || !nodePositions[n.next]) return null;
        const p1 = nodePositions[n.id];
        const p2 = nodePositions[n.next];

        const r = CELL_SIZE / 2;
        const c1x = p1.x + r;
        const c1y = p1.y + r;
        const c2x = p2.x + r;
        const c2y = p2.y + r;

        let pathD = '';

        if (c1y === c2y) {
            if (c2x > c1x) {
                // Straight forward
                pathD = `M ${c1x + r} ${c1y} L ${c2x - r - 6} ${c1y}`;
            } else {
                // Cycle back within same row
                pathD = `M ${c1x} ${c1y + r} C ${c1x} ${c1y + r + 60}, ${c2x} ${c2y + r + 60}, ${c2x} ${c2y + r + 6}`;
            }
        } else {
            // Cross row link
            pathD = `M ${c1x} ${c1y + r} C ${c1x} ${c2y}, ${c2x - 60} ${c2y}, ${c2x - r - 6} ${c2y}`;
        }

        return (
            <motion.path
                key={`edge-${n.id}-${n.next}`}
                d={pathD}
                stroke="#8B949E"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            />
        );
    };

    return (
        <div className="flex flex-col items-center mb-8">
            <h3 className="text-text-secondary text-sm font-mono mb-2 flex items-center gap-2 self-start ml-4">
                <span className="text-accent-primary font-bold">Linked List Graph</span>
            </h3>

            <div className="overflow-x-auto w-full flex justify-center mt-4">
                <svg
                    width={Math.max(totalWidth, 400)}
                    height={totalHeight}
                    className="overflow-visible"
                    style={{ minWidth: totalWidth }}
                >
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#8B949E" />
                        </marker>
                    </defs>

                    <g transform={`translate(${PADDING}, ${PADDING + 40})`}>
                        {/* Edges */}
                        {Object.values(nodes).map(renderEdge)}

                        {/* Nodes */}
                        {Object.values(nodes).map(node => {
                            const pos = nodePositions[node.id];
                            if (!pos) return null;
                            return (
                                <ArrayNode
                                    key={node.id}
                                    value={node.val}
                                    xPos={pos.x}
                                    yPos={pos.y}
                                    size={CELL_SIZE}
                                    shape="circle"
                                    showIndex={false}
                                />
                            );
                        })}

                        {/* Pointers */}
                        {Object.entries(pointersByNode).map(([targetId, names]) => {
                            const pos = nodePositions[targetId];
                            if (!pos) return null;
                            return (
                                <motion.g
                                    key={`ptrGrp-${targetId}`}
                                    layout
                                    initial={{ x: pos.x + CELL_SIZE / 2, y: pos.y - 12, opacity: 0 }}
                                    animate={{ x: pos.x + CELL_SIZE / 2, y: pos.y - 12, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Small arrow touching the node */}
                                    <path d="M 0 0 L -6 -10 L 6 -10 Z" fill="#9ECE6A" />

                                    {/* Stacked labels */}
                                    {names.map((name, idx) => (
                                        <text
                                            key={name}
                                            x={0}
                                            y={-22 - (idx * 16)}
                                            textAnchor="middle"
                                            fill="#9ECE6A"
                                            fontSize="13"
                                            fontWeight="600"
                                            fontFamily="monospace"
                                        >
                                            {name}
                                        </text>
                                    ))}
                                </motion.g>
                            );
                        })}
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default LinkedListVisualizer;
