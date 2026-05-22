import { useCallback } from 'react';
import type { RecursionEvent } from './useSemanticGraph';

interface TraceStep {
    line: number;
    event: string;
    func_name: string;
    stack: any[];
    objects: Record<string, any>;
    exception?: string;
}

interface UseSemanticSteppingProps {
    trace: TraceStep[];
    currentStep: number;
    setCurrentStep: (step: number) => void;
    pause: () => void;
    recursionEvents?: RecursionEvent[];
}

export const useSemanticStepping = ({
    trace,
    currentStep,
    setCurrentStep,
    pause,
    recursionEvents = [],
}: UseSemanticSteppingProps) => {

    const stepFunction = useCallback(() => {
        if (!trace || currentStep >= trace.length - 1) return;
        pause();

        const currentFrame = trace[currentStep];
        const currentDepth = currentFrame.stack.length;

        // Find next step where we return from current function or depth decreases
        for (let i = currentStep + 1; i < trace.length; i++) {
            const step = trace[i];
            if (step.stack.length < currentDepth || (step.event === 'return' && step.stack.length === currentDepth)) {
                setCurrentStep(i);
                return;
            }
        }

        // If not found, just go to end
        setCurrentStep(trace.length - 1);
    }, [trace, currentStep, setCurrentStep, pause]);

    const stepLoop = useCallback(() => {
        if (!trace || currentStep >= trace.length - 1) return;
        pause();

        const currentFrame = trace[currentStep];
        const currentLine = currentFrame.line;
        const currentDepth = currentFrame.stack.length;

        for (let i = currentStep + 1; i < trace.length; i++) {
            const step = trace[i];

            // If we exit the function, stop here
            if (step.stack.length < currentDepth) {
                setCurrentStep(i);
                return;
            }

            // If we are at the same depth, check if line goes backwards or hits same line (loop header)
            if (step.stack.length === currentDepth && step.line <= currentLine) {
                // If the line went backwards, we found the next iteration
                // We advance one more step if possible so we don't just sit on the 'while/for' keyword every time
                const target = Math.min(i + 1, trace.length - 1);
                setCurrentStep(target);
                return;
            }
        }

        setCurrentStep(trace.length - 1);
    }, [trace, currentStep, setCurrentStep, pause]);

    const stepPointer = useCallback(() => {
        if (!trace || currentStep >= trace.length - 1) return;
        pause();

        const currentFrame = trace[currentStep];
        const currentDepth = currentFrame.stack.length;
        const startLocalsStr = JSON.stringify(currentFrame.stack[0]?.locals || {});

        for (let i = currentStep + 1; i < trace.length; i++) {
            const step = trace[i];

            // Auto stop if we exit function
            if (step.stack.length < currentDepth) {
                setCurrentStep(i);
                return;
            }

            // Check if locals changed
            if (step.stack.length === currentDepth) {
                const stepLocalsStr = JSON.stringify(step.stack[0]?.locals || {});
                if (stepLocalsStr !== startLocalsStr) {
                    setCurrentStep(i);
                    return;
                }
            }
        }

        setCurrentStep(trace.length - 1);
    }, [trace, currentStep, setCurrentStep, pause]);

    // ─── v2: Step by recursion depth change ─────
    const stepRecursion = useCallback(() => {
        if (!trace || currentStep >= trace.length - 1) return;
        pause();

        // Find next recursion event after current step
        for (const event of recursionEvents) {
            if (event.step > currentStep) {
                setCurrentStep(event.step);
                return;
            }
        }
        setCurrentStep(trace.length - 1);
    }, [trace, currentStep, setCurrentStep, pause, recursionEvents]);

    // ─── v2: Step to next backtrack event ─────
    const stepBacktrack = useCallback(() => {
        if (!trace || currentStep >= trace.length - 1) return;
        pause();

        for (const event of recursionEvents) {
            if (event.step > currentStep && event.type === 'backtrack') {
                setCurrentStep(event.step);
                return;
            }
        }
        setCurrentStep(trace.length - 1);
    }, [trace, currentStep, setCurrentStep, pause, recursionEvents]);

    // ─── v2: Step to next mutation cluster (2+ vars change) ─────
    const stepMutation = useCallback(() => {
        if (!trace || currentStep >= trace.length - 1) return;
        pause();

        for (let i = currentStep + 1; i < trace.length; i++) {
            const curr = trace[i];
            const prev = trace[i - 1];

            if (!curr.stack?.[0]?.locals || !prev.stack?.[0]?.locals) continue;

            const currLocals = curr.stack[0].locals;
            const prevLocals = prev.stack[0].locals;
            let changes = 0;

            for (const key of Object.keys(currLocals)) {
                if (key in prevLocals && JSON.stringify(currLocals[key]) !== JSON.stringify(prevLocals[key])) {
                    changes++;
                }
            }

            if (changes >= 2) {
                setCurrentStep(i);
                return;
            }
        }

        setCurrentStep(trace.length - 1);
    }, [trace, currentStep, setCurrentStep, pause]);

    return {
        stepFunction,
        stepLoop,
        stepPointer,
        stepRecursion,
        stepBacktrack,
        stepMutation,
    };
};

