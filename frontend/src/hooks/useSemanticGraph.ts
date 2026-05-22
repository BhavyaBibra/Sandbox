import { useMemo } from 'react';

// ─── Data Types ─────────────────────────────────────────

export interface CallNode {
    id: string;
    funcName: string;
    args: string; // serialized args summary
    depth: number;
    startStep: number;
    endStep: number;
    children: CallNode[];
    parent: CallNode | null;
}

export interface MutationEvent {
    step: number;
    variable: string;
    oldValue: any;
    newValue: any;
}

export interface RecursionEvent {
    step: number;
    type: 'entry' | 'exit' | 'backtrack';
    depth: number;
    funcName: string;
    args: string;
}

export interface SemanticAnnotation {
    step: number;
    type: 'recursion_entry' | 'recursion_exit' | 'backtrack' | 'mutation_cluster' | 'board_decision';
    message: string;
    severity: 'info' | 'warning' | 'highlight';
}

export interface SemanticGraph {
    callTree: CallNode[];
    mutations: MutationEvent[];
    heatmap: Map<string, Map<number, number>>; // variable → index → access count
    recursionEvents: RecursionEvent[];
    annotations: SemanticAnnotation[];
    isRecursive: boolean;
    maxDepth: number;
}

// ─── Trace step structure (matches tracer.py output) ─────

interface TraceStep {
    line: number;
    event: string;
    func_name: string;
    stack: Array<{
        name: string;
        line: number;
        locals: Record<string, any>;
    }>;
    objects: Record<string, any>;
    exception?: string;
}

// ─── Helper: extract argument summary from locals ─────

function extractArgs(locals: Record<string, any>): string {
    const skip = new Set(['self', '__return__']);
    const args: string[] = [];
    for (const [k, v] of Object.entries(locals)) {
        if (skip.has(k)) continue;
        const val = typeof v === 'object' && v !== null
            ? (v.type === 'ref' ? `ref:${v.id}` : JSON.stringify(v).slice(0, 30))
            : String(v);
        args.push(`${k}=${val}`);
        if (args.length >= 3) break; // limit to 3 args for readability
    }
    return args.join(', ');
}

// ─── Main Hook ──────────────────────────────────────────

export const useSemanticGraph = (trace: TraceStep[]): SemanticGraph => {
    return useMemo(() => {
        const empty: SemanticGraph = {
            callTree: [],
            mutations: [],
            heatmap: new Map(),
            recursionEvents: [],
            annotations: [],
            isRecursive: false,
            maxDepth: 0,
        };

        if (!trace || trace.length === 0) return empty;

        // ─── Pass 1: Build call tree + recursion events ─────

        const callTree: CallNode[] = [];
        const recursionEvents: RecursionEvent[] = [];
        const annotations: SemanticAnnotation[] = [];
        let maxDepth = 0;
        let nodeCounter = 0;

        // Stack-based tree builder
        const nodeStack: CallNode[] = [];
        let prevDepth = 0;

        for (let step = 0; step < trace.length; step++) {
            const t = trace[step];
            const depth = t.stack?.length || 0;
            if (depth > maxDepth) maxDepth = depth;

            // Depth increased → new call entry
            if (depth > prevDepth) {
                const funcName = t.func_name || t.stack?.[0]?.name || '<unknown>';
                const args = t.stack?.[0]?.locals ? extractArgs(t.stack[0].locals) : '';

                const node: CallNode = {
                    id: `call-${nodeCounter++}`,
                    funcName,
                    args,
                    depth,
                    startStep: step,
                    endStep: step,
                    children: [],
                    parent: nodeStack.length > 0 ? nodeStack[nodeStack.length - 1] : null,
                };

                // Add as child of parent or as root
                if (node.parent) {
                    node.parent.children.push(node);
                } else {
                    callTree.push(node);
                }

                nodeStack.push(node);

                recursionEvents.push({
                    step,
                    type: 'entry',
                    depth,
                    funcName,
                    args,
                });

                if (depth > 1) {
                    annotations.push({
                        step,
                        type: 'recursion_entry',
                        message: `Entering ${funcName}(${args.slice(0, 40)})`,
                        severity: 'info',
                    });
                }
            }

            // Depth decreased → return/backtrack
            if (depth < prevDepth) {
                const levelsExited = prevDepth - depth;
                for (let l = 0; l < levelsExited; l++) {
                    const exitedNode = nodeStack.pop();
                    if (exitedNode) {
                        exitedNode.endStep = step - 1;

                        // Detect backtrack: if the function has siblings after it
                        // (parent will get more children later), this is a backtrack
                        const isBacktrack = exitedNode.parent &&
                            exitedNode.parent.children.length > 0 &&
                            exitedNode.depth > 1;

                        recursionEvents.push({
                            step,
                            type: isBacktrack ? 'backtrack' : 'exit',
                            depth: exitedNode.depth,
                            funcName: exitedNode.funcName,
                            args: exitedNode.args,
                        });

                        if (isBacktrack && exitedNode.depth > 1) {
                            annotations.push({
                                step,
                                type: 'backtrack',
                                message: `Backtracking from ${exitedNode.funcName}`,
                                severity: 'warning',
                            });
                        } else if (exitedNode.depth > 1) {
                            annotations.push({
                                step,
                                type: 'recursion_exit',
                                message: `Returning from ${exitedNode.funcName}`,
                                severity: 'info',
                            });
                        }
                    }
                }
            }

            // Update endStep for current top of stack
            if (nodeStack.length > 0) {
                nodeStack[nodeStack.length - 1].endStep = step;
            }

            prevDepth = depth;
        }

        // Close any remaining open nodes
        while (nodeStack.length > 0) {
            const node = nodeStack.pop();
            if (node) node.endStep = trace.length - 1;
        }

        const isRecursive = maxDepth > 1;

        // ─── Pass 2: Mutation events + heatmap + annotations ─────

        const mutations: MutationEvent[] = [];
        const heatmap = new Map<string, Map<number, number>>();

        for (let step = 1; step < trace.length; step++) {
            const curr = trace[step];
            const prev = trace[step - 1];

            if (!curr.stack?.[0]?.locals || !prev.stack?.[0]?.locals) continue;

            const currLocals = curr.stack[0].locals;
            const prevLocals = prev.stack[0].locals;
            let mutationCount = 0;

            for (const [key, currVal] of Object.entries(currLocals)) {
                const prevVal = prevLocals[key];
                if (prevVal === undefined) continue;

                const currStr = JSON.stringify(currVal);
                const prevStr = JSON.stringify(prevVal);

                if (currStr !== prevStr) {
                    mutations.push({ step, variable: key, oldValue: prevVal, newValue: currVal });
                    mutationCount++;
                }

                // Heatmap: track index accesses for arrays/matrices
                // If a variable is an array ref and pointers changed, record accesses
                if (currVal && typeof currVal === 'object' && currVal.type === 'ref') {
                    const obj = curr.objects?.[currVal.id];
                    if (obj && (obj.type === 'list' || obj.type === 'matrix')) {
                        // Track which indices were accessed (approximated by pointer values)
                        for (const [ptrName, ptrVal] of Object.entries(currLocals)) {
                            if (typeof ptrVal === 'number' && ptrVal >= 0) {
                                const prevPtrVal = prevLocals[ptrName];
                                if (prevPtrVal !== ptrVal) {
                                    // A pointer moved → the new index was accessed
                                    if (!heatmap.has(key)) heatmap.set(key, new Map());
                                    const indexMap = heatmap.get(key)!;
                                    indexMap.set(ptrVal as number, (indexMap.get(ptrVal as number) || 0) + 1);
                                }
                            }
                        }
                    }
                }
            }

            // Mutation cluster annotation
            if (mutationCount >= 2) {
                annotations.push({
                    step,
                    type: 'mutation_cluster',
                    message: `${mutationCount} variables updated simultaneously`,
                    severity: 'highlight',
                });
            }

            // Board decision annotation
            for (const [key, currVal] of Object.entries(currLocals)) {
                if ((key === 'board' || key.includes('board') || key === 'grid') &&
                    currVal && typeof currVal === 'object' && currVal.type === 'ref') {
                    const obj = curr.objects?.[currVal.id];
                    const prevObj = prev.objects?.[currVal.id];
                    if (obj && prevObj && obj.type === 'matrix' && prevObj.type === 'matrix') {
                        // Check if any cell changed
                        const currRows = obj.value || [];
                        const prevRows = prevObj.value || [];
                        for (let r = 0; r < currRows.length; r++) {
                            const currRow = currRows[r]?.value || currRows[r] || [];
                            const prevRow = prevRows[r]?.value || prevRows[r] || [];
                            for (let c = 0; c < currRow.length; c++) {
                                if (JSON.stringify(currRow[c]) !== JSON.stringify(prevRow[c])) {
                                    const newVal = currRow[c];
                                    const valStr = typeof newVal === 'string' ? newVal : String(newVal);
                                    if (valStr === 'Q' || valStr === '1' || valStr === 'true') {
                                        annotations.push({
                                            step,
                                            type: 'board_decision',
                                            message: `Placed ${valStr === 'Q' ? 'Queen' : valStr} at (${r}, ${c})`,
                                            severity: 'highlight',
                                        });
                                    } else if (valStr === '.' || valStr === '0' || valStr === 'false' || valStr === 'None') {
                                        annotations.push({
                                            step,
                                            type: 'board_decision',
                                            message: `Removed piece at (${r}, ${c})`,
                                            severity: 'warning',
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Sort annotations by step
        annotations.sort((a, b) => a.step - b.step);

        return {
            callTree,
            mutations,
            heatmap,
            recursionEvents,
            annotations,
            isRecursive,
            maxDepth,
        };
    }, [trace]);
};
