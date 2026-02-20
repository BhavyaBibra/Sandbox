import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SetVisualizerProps {
    data: any[];
    name: string;
}

const SetVisualizer: React.FC<SetVisualizerProps> = ({ data, name }) => {
    // Sort items for stable rendering in the flex box
    const items = useMemo(() => {
        return [...data].sort((a, b) => {
            if (typeof a === 'number' && typeof b === 'number') return a - b;
            return String(a).localeCompare(String(b));
        });
    }, [data]);

    if (items.length === 0) return null;

    return (
        <div className="flex flex-col items-start mb-8 w-full">
            <h3 className="text-text-secondary text-sm font-mono mb-4 flex items-center gap-2 ml-4">
                <span className="text-accent-primary font-bold">{name}</span>
                <span className="text-xs text-zinc-500">set</span>
            </h3>

            {/* A set is an unordered collection, so we visualize it as floating bubbles inside a container */}
            <div className="ml-8 p-6 bg-bg-secondary/30 border border-border-default rounded-xl border-dashed min-w-[300px] flex flex-wrap gap-4 items-center justify-center relative">
                <AnimatePresence>
                    {items.map((val) => {
                        const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
                        return (
                            <motion.div
                                key={strVal}
                                layout
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20
                                }}
                                className="flex items-center justify-center w-14 h-14 bg-bg-secondary border-2 border-accent-success/50 rounded-full text-text-primary font-mono text-sm shadow-lg shadow-accent-success/10"
                            >
                                {strVal}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SetVisualizer;
