import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import ArrayNode from './ArrayNode';

export interface TreeVisualizerProps {
    nodes: { [id: string]: { id: string, val: any, left: string | null, right: string | null } };
    pointers: { [key: string]: string };
}

interface TreeNodePos {
    id: string;
    x: number;
    y: number;
    depth: number;
}

const CELL_SIZE = 50;
const Y_SPACING = 80;
const MIN_X_SPACING = 60;
const PADDING = 40;

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ nodes, pointers }) => {
    if (Object.keys(nodes).length === 0) return null;

    const { positions, edges, totalWidth, totalHeight } = useMemo(() => {
        // Find roots (nodes with no incoming edges)
        const inDegree: Record<string, number> = {};
        Object.keys(nodes).forEach(id => inDegree[id] = 0);

        Object.values(nodes).forEach(node => {
            if (node.left && inDegree[node.left] !== undefined) inDegree[node.left]++;
            if (node.right && inDegree[node.right] !== undefined) inDegree[node.right]++;
        });

        // Use nodes pointed to by variables as root hints if they have 0 in-degree
        let rootIds = Object.values(pointers).filter(id => nodes[id] && inDegree[id] === 0);

        // If no pointers point to roots, just find all 0 in-degree nodes
        if (rootIds.length === 0) {
            rootIds = Object.keys(nodes).filter(id => inDegree[id] === 0);
        }

        // De-duplicate roots
        rootIds = Array.from(new Set(rootIds));

        // If still nothing, just pick the first node (fallback for cyclic/disconnected weirdness)
        if (rootIds.length === 0 && Object.keys(nodes).length > 0) {
            rootIds = [Object.keys(nodes)[0]];
        }

        const outPositions: Record<string, TreeNodePos> = {};
        const outEdges: { source: string, target: string, type: 'left' | 'right' }[] = [];

        let maxDepth = 0;
        let currentXOffset = PADDING;

        // Simple Layout Algorithm based on In-Order traversal conceptual width
        const layoutTree = (rootId: string) => {
            // First pass: compute depths and logical widths
            const depths: Record<string, number> = {};
            const widths: Record<string, number> = {};

            const computeProps = (nodeId: string, depth: number): number => {
                if (!nodes[nodeId]) return 0;
                depths[nodeId] = depth;
                if (depth > maxDepth) maxDepth = depth;

                const node = nodes[nodeId];
                let width = 0;

                if (node.left) {
                    outEdges.push({ source: nodeId, target: node.left, type: 'left' });
                    width += computeProps(node.left, depth + 1);
                } else {
                    width += 0.5; // Imaginary space for missing child to maintain balance
                }

                const rootWidth = 1;

                if (node.right) {
                    outEdges.push({ source: nodeId, target: node.right, type: 'right' });
                    width += computeProps(node.right, depth + 1);
                } else {
                    width += 0.5;
                }

                widths[nodeId] = Math.max(rootWidth, width);
                return widths[nodeId];
            };

            computeProps(rootId, 0);

            // Second pass: assign coordinates
            const assignCoords = (nodeId: string, minX: number, maxX: number) => {
                if (!nodes[nodeId]) return;

                const node = nodes[nodeId];
                const x = minX + (maxX - minX) / 2;
                const y = PADDING + depths[nodeId] * Y_SPACING;

                outPositions[nodeId] = { id: nodeId, x, y, depth: depths[nodeId] };

                const midX = x;

                if (node.left) {
                    assignCoords(node.left, minX, midX);
                }
                if (node.right) {
                    assignCoords(node.right, midX, maxX);
                }
            };

            const totalLogicalWidth = widths[rootId];
            const pixelWidth = totalLogicalWidth * MIN_X_SPACING;

            assignCoords(rootId, currentXOffset, currentXOffset + pixelWidth);

            currentXOffset += pixelWidth + MIN_X_SPACING; // Add margin between disconnected trees
        };

        // Layout all found components
        const visitedForLayout = new Set<string>();
        rootIds.forEach(id => {
            if (!visitedForLayout.has(id)) {
                layoutTree(id);
                // Mark all reachable from this root as visited (simplified here by just checking if it hit positions map)
                Object.keys(outPositions).forEach(k => visitedForLayout.add(k));
            }
        });

        // Handle isolated nodes not reachable from roots
        Object.keys(nodes).forEach(id => {
            if (!outPositions[id]) {
                layoutTree(id);
                Object.keys(outPositions).forEach(k => visitedForLayout.add(k));
            }
        });

        return {
            positions: outPositions,
            edges: outEdges,
            totalWidth: currentXOffset + PADDING,
            totalHeight: PADDING * 2 + maxDepth * Y_SPACING + CELL_SIZE
        };
    }, [nodes, pointers]);

    const pointersByNode: Record<string, string[]> = {};
    Object.entries(pointers).forEach(([name, targetId]) => {
        if (!pointersByNode[targetId]) pointersByNode[targetId] = [];
        pointersByNode[targetId].push(name);
    });

    return (
        <div className="flex flex-col items-center mb-8">
            <h3 className="text-text-secondary text-sm font-mono mb-2 flex items-center gap-2 self-start ml-4">
                <span className="text-accent-primary font-bold">Tree Graph</span>
            </h3>

            <div className="overflow-x-auto w-full flex justify-center mt-4">
                <svg
                    width={Math.max(totalWidth, 400)}
                    height={totalHeight}
                    className="overflow-visible"
                    style={{ minWidth: totalWidth }}
                >
                    <g>
                        {/* Edges */}
                        {edges.map((edge, idx) => {
                            const p1 = positions[edge.source];
                            const p2 = positions[edge.target];
                            if (!p1 || !p2) return null;

                            const r = CELL_SIZE / 2;
                            const x1 = p1.x + r;
                            const y1 = p1.y + r;
                            const x2 = p2.x + r;
                            const y2 = p2.y + r;

                            return (
                                <motion.line
                                    key={`edge-${edge.source}-${edge.target}-${idx}`}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="#8B949E"
                                    strokeWidth="2"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            );
                        })}

                        {/* Nodes */}
                        {Object.values(nodes).map(node => {
                            const pos = positions[node.id];
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
                            const pos = positions[targetId];
                            if (!pos) return null;
                            return (
                                <motion.g
                                    key={`ptrGrp-${targetId}`}
                                    layout
                                    initial={{ x: pos.x + CELL_SIZE / 2 + 20, y: pos.y - 12, opacity: 0 }}
                                    animate={{ x: pos.x + CELL_SIZE / 2 + 20, y: pos.y - 12, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Small arrow pointing left towards the node */}
                                    <path d="M 0 0 L 10 -6 L 10 6 Z" fill="#9ECE6A" />

                                    {/* Stacked labels */}
                                    {names.map((name, idx) => (
                                        <text
                                            key={name}
                                            x={16 + (idx * 40)}
                                            y={5}
                                            textAnchor="start"
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

export default TreeVisualizer;
