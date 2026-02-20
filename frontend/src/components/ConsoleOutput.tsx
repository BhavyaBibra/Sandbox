import React from 'react';
import { Terminal, ChevronDown, ChevronRight } from 'lucide-react';

interface ConsoleOutputProps {
    output: string | null;
}

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ output }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);
    const hasOutput = output && output.trim().length > 0;

    return (
        <div className="border-t border-border-default bg-bg-primary">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-colors"
            >
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <Terminal size={12} className={hasOutput ? 'text-accent-success' : ''} />
                <span className="uppercase tracking-wider">Console</span>
                {hasOutput && (
                    <span className="ml-auto px-1.5 py-0.5 bg-accent-success/10 text-accent-success rounded text-[10px] border border-accent-success/20">
                        Output
                    </span>
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-4 pb-3 max-h-40 overflow-y-auto">
                    {hasOutput ? (
                        <pre className="text-sm font-mono text-text-primary whitespace-pre-wrap leading-relaxed bg-bg-canvas/50 rounded-lg p-3 border border-border-default">
                            {output}
                        </pre>
                    ) : (
                        <p className="text-xs text-text-secondary italic py-1">No output — use print() to see results here</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ConsoleOutput;
