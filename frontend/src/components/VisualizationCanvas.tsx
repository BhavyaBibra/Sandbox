import { useState, useCallback } from 'react';
import { useVisualizationState } from '../hooks/useVisualizationState';
import CallStack from './CallStack';
import VisualizationRouter from './VisualizationRouter';
import InsightOverlay from './InsightOverlay';
import useVariableChanges from '../hooks/useVariableChanges';
import type { Insight } from '../hooks/useInsightEngine';
import { Play, ArrowRight, Code2, Eye } from 'lucide-react';

interface VisualizationCanvasProps {
    traceStep: any;
    insights?: Insight[];
    onRun?: () => void;
    isRunning?: boolean;
    trace?: any[];
    currentStep?: number;
}

const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({ traceStep, insights = [], onRun, isRunning = false, trace = [], currentStep = 0 }) => {
    const state = useVisualizationState(traceStep);
    const { arrays, matrices, pointers, integers, strings, linkedListNodes, linkedListPointers, treeNodes, treePointers, dicts, sets } = state;
    const { changed, isNew } = useVariableChanges(trace, currentStep);

    const [focusedObjectId, setFocusedObjectId] = useState<string | null>(null);
    const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

    const toggleWatchlist = useCallback((id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setWatchlist(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleCanvasClick = () => {
        if (focusedObjectId) {
            setFocusedObjectId(null);
        }
    };

    if (isRunning) {
        return (
            <div className="flex h-full items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-primary/5 to-transparent animate-pulse" />
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center">
                        <Code2 size={24} className="text-accent-primary" />
                    </div>
                    <p className="text-text-secondary text-sm font-medium">Tracing execution...</p>
                </div>
            </div>
        );
    }

    if (!traceStep) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="max-w-sm text-center space-y-6">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center shadow-lg shadow-accent-primary/5">
                        <Eye size={28} className="text-accent-primary" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-text-primary tracking-tight">Visualize Your Algorithm</h2>
                        <p className="text-sm text-text-secondary leading-relaxed">Write Python code in the editor, then run it to see variables, data structures, and execution flow come alive.</p>
                    </div>
                    <div className="space-y-3 text-left">
                        {[
                            { num: '1', text: 'Write or paste Python code in the editor' },
                            { num: '2', text: 'Click Run or press Ctrl+Enter' },
                            { num: '3', text: 'Step through execution with arrow keys' },
                        ].map(step => (
                            <div key={step.num} className="flex items-center gap-3 px-4 py-2.5 bg-bg-secondary/50 border border-border-default rounded-lg">
                                <span className="w-6 h-6 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-xs font-bold text-accent-primary shrink-0">{step.num}</span>
                                <span className="text-sm text-text-secondary">{step.text}</span>
                            </div>
                        ))}
                    </div>
                    {onRun && (
                        <button
                            onClick={() => onRun()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-primary hover:bg-accent-primary/90 text-bg-primary text-sm font-bold rounded-lg shadow-md hover:shadow-lg hover:shadow-accent-primary/20 transition-all duration-300"
                        >
                            <Play size={14} fill="currentColor" />
                            Run Default Example
                            <ArrowRight size={14} />
                        </button>
                    )}
                    <p className="text-[11px] text-text-secondary">
                        Press <kbd className="px-1.5 py-0.5 bg-bg-secondary border border-border-default rounded text-[10px] font-mono">?</kbd> for keyboard shortcuts
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="h-full w-full bg-bg-canvas p-8 overflow-auto relative"
            onClick={handleCanvasClick}
        >
            <h2 className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-8">Visualization Canvas</h2>

            <CallStack stack={traceStep?.stack || []} changedVars={changed} newVars={isNew} />

            <div className="flex flex-col gap-12 pb-20 mt-8">
                <VisualizationRouter
                    arrays={arrays}
                    matrices={matrices}
                    strings={strings || {}}
                    dicts={dicts || {}}
                    sets={sets || {}}
                    linkedListNodes={linkedListNodes || {}}
                    linkedListPointers={linkedListPointers || {}}
                    treeNodes={treeNodes || {}}
                    treePointers={treePointers || {}}
                    pointers={pointers}
                    focusedObjectId={focusedObjectId}
                    setFocusedObjectId={setFocusedObjectId}
                    watchlist={watchlist}
                    toggleWatchlist={toggleWatchlist}
                />

                {/* Fallback for when no complex data structures are present */}
                {Object.keys(arrays).length === 0 && Object.keys(matrices).length === 0 && Object.keys(linkedListNodes || {}).length === 0 && Object.keys(treeNodes || {}).length === 0 && Object.keys(dicts || {}).length === 0 && Object.keys(sets || {}).length === 0 && Object.keys(strings || {}).length === 0 && (
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(integers).map(([name, val]) => (
                            <div key={name} className="p-4 bg-bg-secondary border border-border-default rounded flex justify-between items-center">
                                <span className="text-text-secondary font-mono">{name}</span>
                                <span className="text-accent-primary font-mono font-bold">{val}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <InsightOverlay insights={insights} />
        </div>

    );
};

export default VisualizationCanvas;
