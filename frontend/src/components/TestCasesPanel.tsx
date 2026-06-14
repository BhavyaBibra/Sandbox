import React from 'react';
import Editor from "@monaco-editor/react";
import { TestTube2, Target } from 'lucide-react';

interface TestCasesPanelProps {
    testCasesCode: string;
    setTestCasesCode: (val: string) => void;
    expectedOutput: string;
    setExpectedOutput: (val: string) => void;
}

const TestCasesPanel: React.FC<TestCasesPanelProps> = ({
    testCasesCode,
    setTestCasesCode,
    expectedOutput,
    setExpectedOutput
}) => {
    return (
        <div className="flex flex-col h-full w-full bg-bg-secondary overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-default bg-bg-primary">
                <div className="flex items-center gap-2">
                    <TestTube2 size={16} className="text-accent-primary" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Test Cases</h3>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Target size={14} className="text-text-muted" />
                        <span className="text-xs text-text-muted font-medium">Expected Output:</span>
                        <input
                            type="text"
                            value={expectedOutput}
                            onChange={(e) => setExpectedOutput(e.target.value)}
                            placeholder="e.g. 3, [1,2], True"
                            className="bg-bg-tertiary border border-border-default rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary w-32 font-mono"
                        />
                    </div>
                </div>
            </div>
            <div className="flex-1 min-h-0 relative">
                <Editor
                    height="100%"
                    defaultLanguage="python"
                    value={testCasesCode}
                    onChange={(val) => setTestCasesCode(val || '')}
                    theme="dsa-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 8, bottom: 8 },
                        fontFamily: 'JetBrains Mono, monospace',
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 3
                    }}
                />
            </div>
        </div>
    );
};

export default TestCasesPanel;
