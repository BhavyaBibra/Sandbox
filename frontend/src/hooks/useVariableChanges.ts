import { useMemo } from 'react';

interface TraceStep {
    stack: Array<{
        locals: Record<string, any>;
    }>;
}

/**
 * Compares the top stack frame locals between the current step and the previous step.
 * Returns a Set of variable names that changed, and a Set of variables that are new.
 */
const useVariableChanges = (trace: TraceStep[], currentStep: number) => {
    return useMemo(() => {
        const changed = new Set<string>();
        const isNew = new Set<string>();

        if (currentStep <= 0 || !trace[currentStep] || !trace[currentStep - 1]) {
            // First step: everything is "new"
            if (currentStep === 0 && trace[currentStep]?.stack?.[0]?.locals) {
                Object.keys(trace[currentStep].stack[0].locals).forEach(k => isNew.add(k));
            }
            return { changed, isNew };
        }

        const currentLocals = trace[currentStep]?.stack?.[0]?.locals || {};
        const prevLocals = trace[currentStep - 1]?.stack?.[0]?.locals || {};

        for (const key of Object.keys(currentLocals)) {
            if (!(key in prevLocals)) {
                isNew.add(key);
            } else {
                // Deep compare via JSON serialization (good enough for primitive/simple values)
                const curr = JSON.stringify(currentLocals[key]);
                const prev = JSON.stringify(prevLocals[key]);
                if (curr !== prev) {
                    changed.add(key);
                }
            }
        }

        return { changed, isNew };
    }, [trace, currentStep]);
};

export default useVariableChanges;
