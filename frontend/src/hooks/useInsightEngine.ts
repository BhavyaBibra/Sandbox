import { useMemo } from 'react';

export interface Insight {
    id: string; // unique ID for animation keying
    message: string;
    type: 'update' | 'pointer' | 'loop' | 'system';
}

export const useInsightEngine = (trace: any[], currentStep: number, code: string): Insight[] => {
    return useMemo(() => {
        if (!trace || trace.length === 0 || currentStep <= 0) {
            return [];
        }

        const current = trace[currentStep];
        const prev = trace[currentStep - 1];
        const insights: Insight[] = [];

        // Protection against missing stack frames
        if (!current.stack || current.stack.length === 0 || !prev.stack || prev.stack.length === 0) {
            return [];
        }

        const currLocals = current.stack[0].locals || {};
        const prevLocals = prev.stack[0].locals || {};

        // 1. Loop Iteration Started
        if (currentStep > 0 && current.event === 'line') {
            const lines = code.split('\n');
            if (current.line > 0 && current.line <= lines.length) {
                const codeLine = lines[current.line - 1].trim();
                const isLoopLine = codeLine.startsWith('while ') || codeLine.startsWith('for ');

                if (isLoopLine) {
                    insights.push({
                        id: `loop-${currentStep}`,
                        message: 'Loop condition evaluated',
                        type: 'loop'
                    });
                }
            }
        }

        // 2. Variable Updates & Pointer Moves
        const commonPointers = ['left', 'right', 'i', 'j', 'k', 'ptr', 'curr', 'prev', 'next', 'start', 'end', 'low', 'high'];

        for (const [key, currVal] of Object.entries(currLocals)) {
            const prevVal = prevLocals[key];

            if (prevVal !== undefined) {
                const isCurrPrimitive = typeof currVal === 'number' || typeof currVal === 'string';
                const isPrevPrimitive = typeof prevVal === 'number' || typeof prevVal === 'string';

                if (isCurrPrimitive && isPrevPrimitive && currVal !== prevVal) {
                    if (commonPointers.includes(key.toLowerCase())) {
                        insights.push({
                            id: `ptr-${key}-${currentStep}`,
                            message: `Pointer '${key}' moved (${prevVal} → ${currVal})`,
                            type: 'pointer'
                        });
                    } else {
                        insights.push({
                            id: `upd-${key}-${currentStep}`,
                            message: `Variable '${key}' updated to ${currVal}`,
                            type: 'update'
                        });
                    }
                }
            } else if (prevVal === undefined && currVal !== undefined) {
                // New variable initialized
                const isCurrPrimitive = typeof currVal === 'number' || typeof currVal === 'string';
                if (isCurrPrimitive) {
                    insights.push({
                        id: `init-${key}-${currentStep}`,
                        message: `Variable '${key}' initialized to ${currVal}`,
                        type: 'update'
                    });
                }
            }
        }

        return insights;
    }, [trace, currentStep, code]);
};
