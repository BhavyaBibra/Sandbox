import React from 'react';
import { Circle, CheckCircle2, Clock } from 'lucide-react';

interface StatusBarProps {
    currentStep: number;
    totalSteps: number;
    pattern?: {
        pattern: string;
        confidence: number;
    };
    executionState: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
}

const StatusBar: React.FC<StatusBarProps> = ({
    currentStep,
    totalSteps,
    pattern,
    executionState
}) => {
    return (
        <div className="h-8 border-t border-border-default bg-bg-secondary flex items-center px-4 justify-between shrink-0 text-xs text-text-secondary select-none">
            {/* Left: Step Counter */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <ActivityIndicator state={executionState} />
                    <span className="font-mono">
                        {executionState === 'IDLE' ? 'Ready' : `Step ${currentStep + 1} / ${totalSteps}`}
                    </span>
                </div>
            </div>

            {/* Center: Pattern Info */}
            {pattern && (
                <div className="flex items-center gap-2 text-accent-primary">
                    <span className="text-text-secondary">Detected Pattern:</span>
                    <span className="font-medium">{pattern.pattern}</span>
                    <span className="bg-accent-primary/10 text-accent-primary px-1.5 py-0.5 rounded text-[10px] border border-accent-primary/20">
                        {(pattern.confidence * 100).toFixed(0)}%
                    </span>
                </div>
            )}

            {/* Right: State */}
            <div className="flex items-center gap-2">
                <span className="uppercase tracking-wider font-medium text-[10px] text-text-secondary">
                    {executionState}
                </span>
            </div>
        </div>
    );
};

const ActivityIndicator: React.FC<{ state: string }> = ({ state }) => {
    switch (state) {
        case 'RUNNING':
            return <Clock size={12} className="text-accent-warning animate-pulse" />;
        case 'COMPLETED':
            return <CheckCircle2 size={12} className="text-accent-success" />;
        case 'PAUSED':
            return <Circle size={12} className="text-text-secondary" />;
        default:
            return <Circle size={12} className="text-border-hover" />;
    }
};

export default StatusBar;
