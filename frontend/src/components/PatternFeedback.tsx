import React from 'react';
import { Lightbulb } from 'lucide-react';

interface PatternFeedbackProps {
    pattern?: {
        pattern: string;
        confidence: number;
        tests: string[];
    };
    onApplyTest: (testCode: string) => void;
}

const PatternFeedback: React.FC<PatternFeedbackProps> = ({ pattern, onApplyTest }) => {
    if (!pattern) return null;

    return (
        <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm animate-fade-in relative">
            <div className="absolute top-2 right-2">
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Analysis</span>
            </div>

            <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-full text-indigo-600 shadow-sm mt-1">
                    <Lightbulb size={20} />
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        Detected: {pattern.pattern}
                        <span className="text-xs font-normal text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
                            {(pattern.confidence * 100).toFixed(0)}% match
                        </span>
                    </h3>

                    <p className="text-sm text-gray-600 mt-1 mb-3">
                        We noticed you're implementing <strong>{pattern.pattern}</strong>.
                        Here are some edge cases to test your logic:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {pattern.tests.map((test, idx) => (
                            <button
                                key={idx}
                                onClick={() => onApplyTest(test)}
                                className="text-left text-xs font-mono bg-white border border-gray-200 p-2 rounded hover:border-indigo-300 hover:shadow-sm transition-all text-gray-700 truncate"
                                title="Click to append to code"
                            >
                                {test}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatternFeedback;
