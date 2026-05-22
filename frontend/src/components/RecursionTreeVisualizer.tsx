import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CallNode } from '../hooks/useSemanticGraph';
import { GitBranch } from 'lucide-react';

interface RecursionTreeVisualizerProps {
    callTree: CallNode[];
    currentStep: number;
    maxDepth: number;
}

const NODE_W = 130;
const NODE_H = 36;
const H_GAP = 16;
const V_GAP = 50;

// Compute layout — assigns x, y to each node using a post-order traversal
interface LayoutNode {
    node: CallNode;
    x: number;
    y: number;
    width: number;
}

function layoutTree(roots: CallNode[]): { nodes: LayoutNode[]; totalWidth: number; totalHeight: number } {
    const layoutNodes: LayoutNode[] = [];
    let cursor = 0;

    function measure(node: CallNode, depth: number): number {
        const y = depth * (NODE_H + V_GAP);

        if (node.children.length === 0) {
            const x = cursor;
            cursor += NODE_W + H_GAP;
            layoutNodes.push({ node, x, y, width: NODE_W });
            return x;
        }

        const childXPositions: number[] = [];
        for (const child of node.children) {
            childXPositions.push(measure(child, depth + 1));
        }

        // Center parent over children
        const leftmostChild = childXPositions[0];
        const rightmostChild = childXPositions[childXPositions.length - 1];
        const x = (leftmostChild + rightmostChild) / 2;
        layoutNodes.push({ node, x, y, width: NODE_W });
        return x;
    }

    for (const root of roots) {
        measure(root, 0);
    }

    let maxX = 0;
    let maxY = 0;
    for (const ln of layoutNodes) {
        if (ln.x + NODE_W > maxX) maxX = ln.x + NODE_W;
        if (ln.y + NODE_H > maxY) maxY = ln.y + NODE_H;
    }

    return { nodes: layoutNodes, totalWidth: maxX + 40, totalHeight: maxY + 40 };
}

function getNodeState(node: CallNode, currentStep: number): 'pending' | 'active' | 'completed' {
    if (currentStep < node.startStep) return 'pending';
    if (currentStep > node.endStep) return 'completed';
    return 'active';
}

const stateColors = {
    pending: { fill: 'rgba(139,148,158,0.05)', stroke: '#3B3F51', text: '#6B7280' },
    active: { fill: 'rgba(122,162,247,0.15)', stroke: '#7AA2F7', text: '#C8D3F5' },
    completed: { fill: 'rgba(158,206,106,0.08)', stroke: '#4B5563', text: '#8B949E' },
};

const RecursionTreeVisualizer: React.FC<RecursionTreeVisualizerProps> = ({
    callTree,
    currentStep,
    maxDepth,
}) => {
    const { nodes, totalWidth, totalHeight } = useMemo(() => layoutTree(callTree), [callTree]);

    // Build parent→child position map for edges
    const nodePositions = useMemo(() => {
        const map = new Map<string, { x: number; y: number }>();
        for (const ln of nodes) {
            map.set(ln.node.id, { x: ln.x, y: ln.y });
        }
        return map;
    }, [nodes]);

    if (nodes.length <= 1) return null; // No recursion to show

    return (
        <div className="mb-8">
            <h3 className="text-text-secondary text-sm font-mono mb-3 flex items-center gap-2 ml-4">
                <GitBranch size={14} className="text-purple-400" />
                <span className="text-purple-400 font-bold">Recursion Tree</span>
                <span className="text-xs bg-bg-secondary px-1.5 rounded text-text-secondary border border-border-default">
                    depth {maxDepth}
                </span>
            </h3>

            <div className="overflow-x-auto w-full pb-2" style={{ maxHeight: 350 }}>
                <svg
                    width={Math.max(totalWidth, 200)}
                    height={Math.max(totalHeight, 80)}
                    className="overflow-visible"
                >
                    <g transform="translate(20, 20)">
                        {/* Edges — draw before nodes */}
                        {nodes.map(ln => {
                            if (!ln.node.parent) return null;
                            const parentPos = nodePositions.get(ln.node.parent.id);
                            if (!parentPos) return null;

                            const parentState = getNodeState(ln.node.parent, currentStep);
                            const childState = getNodeState(ln.node, currentStep);
                            const isActive = parentState === 'active' || childState === 'active';

                            return (
                                <motion.line
                                    key={`edge-${ln.node.id}`}
                                    x1={parentPos.x + NODE_W / 2}
                                    y1={parentPos.y + NODE_H}
                                    x2={ln.x + NODE_W / 2}
                                    y2={ln.y}
                                    stroke={isActive ? '#7AA2F7' : '#3B3F51'}
                                    strokeWidth={isActive ? 2 : 1}
                                    strokeDasharray={childState === 'pending' ? '4 3' : 'none'}
                                    opacity={childState === 'pending' ? 0.3 : 0.7}
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            );
                        })}

                        {/* Nodes */}
                        <AnimatePresence>
                            {nodes.map(ln => {
                                const state = getNodeState(ln.node, currentStep);
                                const colors = stateColors[state];
                                const label = ln.node.funcName.length > 12
                                    ? ln.node.funcName.slice(0, 11) + '…'
                                    : ln.node.funcName;
                                const argsLabel = ln.node.args.length > 14
                                    ? ln.node.args.slice(0, 13) + '…'
                                    : ln.node.args;

                                return (
                                    <motion.g
                                        key={ln.node.id}
                                        initial={{ opacity: 0, scale: 0.7 }}
                                        animate={{
                                            opacity: state === 'pending' ? 0.3 : 1,
                                            scale: 1,
                                            x: ln.x,
                                            y: ln.y,
                                        }}
                                        transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                                    >
                                        {/* Active glow */}
                                        {state === 'active' && (
                                            <rect
                                                x={-3}
                                                y={-3}
                                                width={NODE_W + 6}
                                                height={NODE_H + 6}
                                                rx={10}
                                                fill="none"
                                                stroke="#7AA2F7"
                                                strokeWidth={1.5}
                                                opacity={0.5}
                                            >
                                                <animate
                                                    attributeName="stroke-opacity"
                                                    values="0.5;0.2;0.5"
                                                    dur="1.5s"
                                                    repeatCount="indefinite"
                                                />
                                            </rect>
                                        )}

                                        {/* Node box */}
                                        <rect
                                            width={NODE_W}
                                            height={NODE_H}
                                            rx={7}
                                            fill={colors.fill}
                                            stroke={colors.stroke}
                                            strokeWidth={state === 'active' ? 2 : 1}
                                        />

                                        {/* Completed checkmark */}
                                        {state === 'completed' && (
                                            <text
                                                x={NODE_W - 14}
                                                y={12}
                                                fontSize={10}
                                                fill="#9ECE6A"
                                            >
                                                ✓
                                            </text>
                                        )}

                                        {/* Function name */}
                                        <text
                                            x={NODE_W / 2}
                                            y={argsLabel ? 13 : NODE_H / 2}
                                            dy=".3em"
                                            textAnchor="middle"
                                            fill={colors.text}
                                            fontSize={11}
                                            fontWeight="700"
                                            fontFamily="'JetBrains Mono', monospace"
                                        >
                                            {label}
                                        </text>

                                        {/* Args */}
                                        {argsLabel && (
                                            <text
                                                x={NODE_W / 2}
                                                y={27}
                                                dy=".3em"
                                                textAnchor="middle"
                                                fill={state === 'active' ? '#9AA5CE' : '#6B7280'}
                                                fontSize={9}
                                                fontFamily="'JetBrains Mono', monospace"
                                            >
                                                {argsLabel}
                                            </text>
                                        )}
                                    </motion.g>
                                );
                            })}
                        </AnimatePresence>
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default RecursionTreeVisualizer;
