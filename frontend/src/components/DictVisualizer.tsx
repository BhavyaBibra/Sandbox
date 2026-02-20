import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DictVisualizerProps {
    data: Record<string, any>;
    name: string;
}

const DictVisualizer: React.FC<DictVisualizerProps> = ({ data, name }) => {
    // Sort keys to maintain a stable vertical layout
    const entries = useMemo(() => {
        return Object.entries(data).sort((a, b) => a[0].localeCompare(b[0]));
    }, [data]);

    if (entries.length === 0) return null;

    return (
        <div className="flex flex-col items-start mb-8 w-full">
            <h3 className="text-text-secondary text-sm font-mono mb-4 flex items-center gap-2 ml-4">
                <span className="text-accent-primary font-bold">{name}</span>
                <span className="text-xs text-zinc-500">dict</span>
            </h3>

            <div className="flex flex-col gap-3 ml-8">
                <AnimatePresence>
                    {entries.map(([key, val]) => (
                        <motion.div
                            key={key}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-4"
                        >
                            {/* Key Node */}
                            <div className="flex items-center justify-center min-w-[60px] h-[40px] px-3 bg-bg-secondary border border-border-default rounded text-accent-warning font-mono text-sm shadow-sm">
                                {String(key)}
                            </div>

                            {/* Connecting Arrow */}
                            <div className="flex items-center text-zinc-500">
                                <svg width="40" height="20" className="overflow-visible">
                                    <defs>
                                        <marker id="dict-arrow" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                                            <polygon points="0 0, 10 3.5, 0 7" fill="#8B949E" />
                                        </marker>
                                    </defs>
                                    <path
                                        d="M 0 10 L 32 10"
                                        stroke="#8B949E"
                                        strokeWidth="2"
                                        fill="none"
                                        markerEnd="url(#dict-arrow)"
                                    />
                                </svg>
                            </div>

                            {/* Value Node */}
                            <motion.div
                                key={`${key}-${JSON.stringify(val)}`} // Change key forces re-animation on value change
                                initial={{ backgroundColor: '#30363D' }} // Flash color
                                animate={{ backgroundColor: '#111827' }} // bg-secondary
                                transition={{ duration: 0.8 }}
                                className="flex items-center justify-center min-w-[60px] h-[40px] px-3 border border-border-default rounded text-text-primary font-mono text-sm shadow-sm"
                            >
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </motion.div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DictVisualizer;
