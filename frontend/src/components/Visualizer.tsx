import React from 'react';

interface VisualizerProps {
    locals: Record<string, any>;
}

const Visualizer: React.FC<VisualizerProps> = ({ locals }) => {
    if (!locals || Object.keys(locals).length === 0) {
        return <div className="text-gray-400 italic">No variables in current scope</div>;
    }

    return (
        <div className="flex flex-col gap-3">
            {Object.entries(locals).map(([name, value]) => (
                <div key={name} className="flex flex-col gap-1 border-b border-gray-100 last:border-0 pb-2">
                    <div className="flex justify-between items-baseline">
                        <span className="font-mono font-bold text-gray-700">{name}</span>
                        <span className="text-xs text-gray-400 font-mono">
                            {getType(value)}
                        </span>
                    </div>
                    <ValueRenderer value={value} />
                </div>
            ))}
        </div>
    );
};

const getType = (val: any): string => {
    if (val === null) return 'None';
    if (typeof val === 'object' && val.type) return `${val.type} @ ${val.id}`;
    return typeof val;
};

const ValueRenderer = ({ value }: { value: any }) => {
    if (value === null) return <span className="text-gray-500 italic">None</span>;

    // Handle complex types from backend (list, dict with IDs)
    if (typeof value === 'object' && value.type) {
        const { type, id, value: content } = value;

        // Show ID pill to help visualize aliasing
        const IdPill = () => (
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-800 mr-2 border border-indigo-200" title={`Object ID: ${id}`}>
                {id.split('_')[1] || id}
            </span>
        );

        if (type === 'list') {
            return (
                <div className="flex items-start">
                    <IdPill />
                    <div className="flex flex-wrap gap-1 items-center bg-white p-1 rounded border border-gray-300">
                        {(content as any[]).map((v, i) => (
                            <div key={i} className="min-w-[24px] text-center border-r border-gray-200 last:border-0 px-1 relative group">
                                <span className="text-[10px] text-gray-400 absolute -top-2 left-0 w-full text-center hidden group-hover:block">{i}</span>
                                <ValueRenderer value={v} />
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        if (type === 'dict') {
            return (
                <div className="flex items-start">
                    <IdPill />
                    <div className="flex flex-col gap-1 bg-white p-2 rounded border border-gray-300 text-sm">
                        {Object.entries(content).map(([k, v]) => (
                            <div key={k} className="flex gap-2">
                                <span className="font-mono text-gray-600">{k}:</span>
                                <ValueRenderer value={v} />
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    }

    // Primitives
    const strVal = typeof value === 'boolean' ? (value ? 'True' : 'False') : String(value);
    const colorClass = typeof value === 'number' ? 'text-blue-600' : typeof value === 'string' ? 'text-green-700' : 'text-purple-600';

    return (
        <span className={`font-mono ${colorClass} break-all`}>
            {typeof value === 'string' ? `"${strVal}"` : strVal}
        </span>
    );
};

export default Visualizer;
