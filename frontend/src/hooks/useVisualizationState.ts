import { useMemo } from 'react';

export interface VisualizationState {
    arrays: { [key: string]: any[] };
    stacks: { [key: string]: any[] };
    boards: { [key: string]: any[][] };
    matrices: { [key: string]: any[][] };
    pointers: { [key: string]: number };
    integers: { [key: string]: number };
    strings: { [key: string]: string };
    linkedListNodes: { [id: string]: { id: string, val: any, next: string | null } };
    linkedListPointers: { [key: string]: string };
    treeNodes: { [id: string]: { id: string, val: any, left: string | null, right: string | null } };
    treePointers: { [key: string]: string };
    dicts: { [key: string]: Record<string, any> };
    sets: { [key: string]: any[] };
}

export const useVisualizationState = (traceStep: any): VisualizationState => {
    return useMemo(() => {
        if (!traceStep || !traceStep.stack || traceStep.stack.length === 0) {
            return { arrays: {}, stacks: {}, boards: {}, matrices: {}, pointers: {}, integers: {}, strings: {}, linkedListNodes: {}, linkedListPointers: {}, treeNodes: {}, treePointers: {}, dicts: {}, sets: {} };
        }

        const currentFrame = traceStep.stack[0]; // Active execution frame is at index 0
        const locals = currentFrame.locals;
        const objectRegistry = traceStep.objects || {};

        const arrays: { [key: string]: any[] } = {};
        const stacks: { [key: string]: any[] } = {};
        const boards: { [key: string]: any[][] } = {};
        const matrices: { [key: string]: any[][] } = {};
        const pointers: { [key: string]: number } = {};
        const integers: { [key: string]: number } = {};
        const strings: { [key: string]: string } = {};
        const linkedListNodes: { [id: string]: { id: string, val: any, next: string | null } } = {};
        const linkedListPointers: { [key: string]: string } = {};
        const treeNodes: { [id: string]: { id: string, val: any, left: string | null, right: string | null } } = {};
        const treePointers: { [key: string]: string } = {};
        const dicts: { [key: string]: Record<string, any> } = {};
        const sets: { [key: string]: any[] } = {};

        // Helper to recursively resolve values
        const resolveValue = (val: any, seen: Set<string> = new Set()): { value: any, type: string } => {
            if (val && typeof val === 'object' && val.type === 'ref') {
                if (seen.has(val.id)) return { value: '[Circular]', type: 'cyclic' };

                seen.add(val.id);
                const obj = objectRegistry[val.id];
                if (obj) {
                    let resolvedObjValue = obj.value;
                    if (Array.isArray(obj.value)) {
                        resolvedObjValue = obj.value.map((v: any) => resolveValue(v, seen).value);
                    } else if (typeof obj.value === 'object' && obj.value !== null) {
                        resolvedObjValue = {};
                        for (const [k, v] of Object.entries(obj.value)) {
                            resolvedObjValue[k] = resolveValue(v, seen).value;
                        }
                    }
                    seen.delete(val.id);
                    return { value: resolvedObjValue, type: obj.type || 'unknown' };
                }
                seen.delete(val.id);
            }
            if (val && typeof val === 'object' && val.type === 'list') {
                const resolvedListValue = Array.isArray(val.value)
                    ? val.value.map((v: any) => resolveValue(v, seen).value)
                    : val.value;
                return { value: resolvedListValue, type: 'list' };
            }
            if (val && typeof val === 'object' && val.type === 'tuple') {
                const resolvedTupleValue = Array.isArray(val.value)
                    ? val.value.map((v: any) => resolveValue(v, seen).value)
                    : val.value;
                return { value: resolvedTupleValue, type: 'tuple' };
            }
            return { value: val, type: typeof val };
        };

        // Parse objects registry for Linked List nodes definition
        Object.values(objectRegistry).forEach((obj: any) => {
            if (obj.type === 'linked_list_node' && obj.value) {
                const rawVal = obj.value.val;
                const rawNext = obj.value.next;

                const resolvedVal = resolveValue(rawVal).value; // Resolve in case val is a ref

                let nextRef = null;
                if (rawNext && typeof rawNext === 'object' && rawNext.type === 'ref') {
                    nextRef = rawNext.id;
                }

                linkedListNodes[obj.id] = {
                    id: obj.id,
                    val: resolvedVal,
                    next: nextRef
                };
            } else if (obj.type === 'tree_node' && obj.value) {
                const rawVal = obj.value.val;
                const rawLeft = obj.value.left;
                const rawRight = obj.value.right;

                const resolvedVal = resolveValue(rawVal).value;

                let leftRef = null;
                if (rawLeft && typeof rawLeft === 'object' && rawLeft.type === 'ref') {
                    leftRef = rawLeft.id;
                }

                let rightRef = null;
                if (rawRight && typeof rawRight === 'object' && rawRight.type === 'ref') {
                    rightRef = rawRight.id;
                }

                treeNodes[obj.id] = {
                    id: obj.id,
                    val: resolvedVal,
                    left: leftRef,
                    right: rightRef
                };
            }
        });

        // Parse locals
        Object.entries(locals).forEach(([key, value]) => {
            // First pass to extract Linked List / Tree pointers directly without deep resolving
            const valAny = value as any;
            if (valAny && typeof valAny === 'object' && valAny.type === 'ref') {
                const targetObj = objectRegistry[valAny.id];
                if (targetObj && targetObj.type === 'linked_list_node') {
                    linkedListPointers[key] = valAny.id;
                    return; // Skip standard value hydration below
                } else if (targetObj && targetObj.type === 'tree_node') {
                    treePointers[key] = valAny.id;
                    return;
                }
            }

            const { value: resolvedValue, type } = resolveValue(value);

            if (type === 'matrix') {
                // Board detection: variable named board/grid and square NxN where N ≤ 9
                const BOARD_NAMES = new Set(['board', 'grid', 'puzzle', 'sudoku', 'queens']);
                const lk = key.toLowerCase();
                const isSquare = resolvedValue.length > 0 && resolvedValue.length === resolvedValue[0]?.length;
                const isSmall = resolvedValue.length <= 9;
                if ((BOARD_NAMES.has(lk) || lk.includes('board')) && isSquare && isSmall) {
                    boards[key] = resolvedValue;
                } else {
                    matrices[key] = resolvedValue;
                }
            } else if (type === 'dict') {
                dicts[key] = resolvedValue;
            } else if (type === 'set') {
                sets[key] = resolvedValue;
            } else if (Array.isArray(resolvedValue)) {
                // Stack detection heuristic: variable names suggesting stack usage
                const STACK_NAMES = new Set(['stack', 'st', 'stk', 'mono_stack', 'min_stack', 'max_stack']);
                const lowerKey = key.toLowerCase();
                if (STACK_NAMES.has(lowerKey) || lowerKey.includes('stack')) {
                    stacks[key] = resolvedValue;
                } else {
                    arrays[key] = resolvedValue;
                }
            } else if (typeof resolvedValue === 'number') {
                // Broad pointer heuristic for common LeetCode variable names
                const POINTER_NAMES = new Set([
                    'i', 'j', 'k', 'l', 'n', 'm', 'p', 'q',
                    'left', 'right', 'low', 'high', 'lo', 'hi',
                    'mid', 'start', 'end', 'top', 'bottom',
                    'row', 'col', 'r', 'c', 'nr', 'nc', 'dr', 'dc',
                    'slow', 'fast', 'prev', 'curr', 'head', 'tail',
                    'begin', 'idx', 'pos', 'ptr', 'front', 'rear',
                    'first', 'last', 'count', 'index',
                ]);
                if (POINTER_NAMES.has(key)) {
                    pointers[key] = resolvedValue;
                }
                integers[key] = resolvedValue;
            } else if (typeof resolvedValue === 'string') {
                // Check if it's a string
                strings[key] = resolvedValue;
            }
        });

        // Sort arrays and matrices
        const sortedArrays: { [key: string]: any[] } = {};
        Object.keys(arrays).sort().forEach(key => sortedArrays[key] = arrays[key]);

        const sortedMatrices: { [key: string]: any[][] } = {};
        Object.keys(matrices).sort().forEach(key => sortedMatrices[key] = matrices[key]);

        return { arrays: sortedArrays, stacks, boards, matrices: sortedMatrices, pointers, integers, strings, linkedListNodes, linkedListPointers, treeNodes, treePointers, dicts, sets };
    }, [traceStep]);
};
