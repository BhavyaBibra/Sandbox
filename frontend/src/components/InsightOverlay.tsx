import React from 'react';
import type { Insight } from '../hooks/useInsightEngine';
import { RefreshCw, Code2, MousePointerClick, Info } from 'lucide-react';

interface InsightOverlayProps {
    insights: Insight[];
}

const InsightOverlay: React.FC<InsightOverlayProps> = ({ insights }) => {
    if (!insights || insights.length === 0) return null;

    const getIcon = (type: Insight['type']) => {
        switch (type) {
            case 'loop': return <RefreshCw size={14} className="text-accent-primary" />;
            case 'pointer': return <MousePointerClick size={14} className="text-accent-warning" />;
            case 'update': return <Code2 size={14} className="text-accent-success" />;
            default: return <Info size={14} className="text-text-secondary" />;
        }
    };

    return (
        <div
            className="absolute bottom-12 flex flex-col gap-3 z-toast pointer-events-none items-end transition-[right] duration-300 ease-in-out"
            style={{ right: 'calc(3rem + var(--right-panel-width, 0px))' }}
        >
            {insights.map((insight) => (
                <div
                    key={insight.id}
                    className="flex items-center gap-3 px-4 py-2.5 bg-bg-secondary/95 backdrop-blur-md border border-border-default rounded-full shadow-2xl animate-in slide-in-from-bottom-2 fade-in duration-300"
                >
                    <div className="p-1.5 bg-bg-primary rounded-full border border-border-default shadow-sm">
                        {getIcon(insight.type)}
                    </div>
                    <span className="text-sm font-semibold text-text-primary tracking-wide">
                        {insight.message}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default InsightOverlay;
