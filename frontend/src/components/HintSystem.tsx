import React from 'react';

// Define Hint Levels
export const HINTS = {
    recursion: [
        "A function calling itself is recursion.",
        "Check your base case. Does it stop?",
        "Ensure the recursive step moves towards the base case."
    ],
    indentation: [
        "Python relies on indentation.",
        "Make sure blocks are aligned.",
        "Use 4 spaces for indentation."
    ],
    generic: [
        "Check for syntax errors.",
        "Make sure variables are defined before use.",
        "Use print() to debug values."
    ]
};

interface HintSystemProps {
    type?: 'recursion' | 'indentation' | 'generic';
}

const HintSystem: React.FC<HintSystemProps> = ({ type = 'generic' }) => {
    const [level, setLevel] = React.useState(0);
    const [isOpen, setIsOpen] = React.useState(false);

    const hints = HINTS[type] || HINTS['generic'];

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded text-sm border border-gray-300 hover:bg-gray-50 transition-colors"
            >
                I'm Stuck
            </button>
        );
    }

    return (
        <div
            className="absolute top-16 z-overlay bg-white p-4 rounded-lg shadow-xl border border-yellow-200 w-64 transition-[right] duration-300 ease-in-out"
            style={{ right: 'calc(1.5rem + var(--right-panel-width, 0px))' }}
        >
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-800">Hint ({level + 1}/{hints.length})</h4>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <p className="text-gray-600 mb-3 text-sm">{hints[level]}</p>
            <div className="flex justify-between">
                <button
                    disabled={level === 0}
                    onClick={() => setLevel(l => l - 1)}
                    className="text-xs text-blue-600 disabled:text-gray-300"
                >
                    Prev
                </button>
                <button
                    disabled={level === hints.length - 1}
                    onClick={() => setLevel(l => l + 1)}
                    className="text-xs text-blue-600 disabled:text-gray-300"
                >
                    Next Hint
                </button>
            </div>
        </div>
    );
};

export default HintSystem;
