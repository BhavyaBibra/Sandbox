import React from 'react';

interface CallStackProps {
    stack: any[];
    changedVars?: Set<string>;
    newVars?: Set<string>;
}

const CallStack: React.FC<CallStackProps> = ({ stack, changedVars = new Set(), newVars = new Set() }) => {
    if (!stack || stack.length === 0) {
        return null;
    }

    return (
        <div
            className="absolute top-4 w-64 bg-bg-secondary/90 backdrop-blur-sm border border-border-default rounded-lg shadow-xl overflow-hidden pointer-events-auto max-h-[400px] flex flex-col z-overlay transition-[right] duration-300 ease-in-out"
            style={{ right: 'calc(1rem + var(--right-panel-width, 0px))' }}
        >
            <div className="px-3 py-2 border-b border-border-default bg-bg-secondary flex justify-between items-center">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Call Stack</h3>
                <span className="text-[10px] text-text-secondary px-1.5 py-0.5 bg-bg-primary rounded-full border border-border-hover">
                    {stack.length} frames
                </span>
            </div>

            <div className="flex flex-col-reverse overflow-y-auto p-2 gap-2">
                {stack.map((frame, index) => {
                    const isTopFrame = index === stack.length - 1;
                    return (
                        <div
                            key={index}
                            className={`p-2.5 rounded text-sm transition-colors border ${isTopFrame
                                ? 'bg-accent-primary/10 border-accent-primary/30'
                                : 'bg-bg-primary border-border-default opacity-60 hover:opacity-100'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1.5">
                                <span className={`font-mono font-bold ${isTopFrame ? 'text-accent-primary' : 'text-text-primary'}`}>
                                    {frame.name}
                                </span>
                                <span className="text-xs text-text-secondary font-mono">
                                    Line {frame.line}
                                </span>
                            </div>

                            {Object.keys(frame.locals).length > 0 && (
                                <div className="space-y-1 mt-2 pt-2 border-t border-border-hover/50">
                                    {Object.entries(frame.locals).map(([key, val]) => {
                                        const isChanged = changedVars.has(key);
                                        const isNewVar = newVars.has(key);
                                        return (
                                            <div
                                                key={key}
                                                className={`flex justify-between items-baseline text-xs rounded px-1 py-0.5 transition-all duration-500 ${isChanged ? 'bg-accent-primary/15 -mx-1' : ''
                                                    } ${isNewVar ? 'bg-accent-success/10 -mx-1' : ''}`}
                                            >
                                                <span className={`font-mono mr-2 ${isChanged ? 'text-accent-primary font-semibold' : isNewVar ? 'text-accent-success font-semibold' : 'text-text-secondary'}`}>
                                                    {key}:
                                                    {isNewVar && <span className="ml-1 text-[9px] bg-accent-success/20 text-accent-success px-1 rounded uppercase font-bold">new</span>}
                                                </span>
                                                <span className={`font-mono truncate max-w-[120px] ${isChanged ? 'text-accent-primary font-semibold' : 'text-text-primary'}`} title={String(val)}>
                                                    {formatValue(val)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Helper to format values for display
const formatValue = (val: any): string => {
    if (typeof val === 'object' && val !== null) {
        if ('type' in val) {
            // Backend serialized object
            const id = (val as any).id?.split('_')[1] || '?';
            const type = (val as any).type;
            if (type === 'list') return `list[${(val as any).value?.length ?? '?'}] @${id}`;
            if (type === 'dict') return `dict @${id}`;
            return `${type} @${id}`;
        }
        return JSON.stringify(val);
    }
    return String(val);
};

export default CallStack;
