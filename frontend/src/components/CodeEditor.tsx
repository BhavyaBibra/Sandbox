import React, { useEffect, useRef } from 'react';
import Editor from "@monaco-editor/react";

type OnMount = (editor: any, monaco: any) => void;

interface CodeEditorProps {
    code: string;
    onChange: (value: string | undefined) => void;
    highlightLine: number | null;
    crashLine?: number | null;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, highlightLine, crashLine }) => {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const decorationsRef = useRef<string[]>([]);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Define Custom Theme
        monaco.editor.defineTheme('dsa-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#0D1117', // bg-editor
                'editor.foreground': '#E6EDF3', // text-primary
                'editor.lineHighlightBackground': '#111827', // bg-secondary
                'editorLineNumber.foreground': '#8B949E', // text-secondary
                'editorCursor.foreground': '#7AA2F7', // accent-primary
                'editorWhitespace.foreground': '#21262D', // border-default
            }
        });
        monaco.editor.setTheme('dsa-dark');
    };

    useEffect(() => {
        if (editorRef.current && monacoRef.current && highlightLine !== null) {
            const isCrash = crashLine === highlightLine;
            const options = isCrash ? {
                isWholeLine: true,
                className: 'bg-red-500/20 border-l-4 border-red-500',
                linesDecorationsClassName: 'bg-red-500 w-2',
            } : {
                isWholeLine: true,
                className: 'bg-accent-primary/20 border-l-4 border-accent-primary',
                linesDecorationsClassName: 'bg-accent-primary w-2',
            };

            const decorations = [{
                range: new monacoRef.current.Range(highlightLine, 1, highlightLine, 1),
                options: options
            }];

            decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, decorations);
            editorRef.current.revealLineInCenter(highlightLine);
        } else if (editorRef.current) {
            decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
        }
    }, [highlightLine]);

    return (
        <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={onChange}
            theme="dsa-dark"
            onMount={handleEditorDidMount}
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 },
                fontFamily: 'JetBrains Mono, monospace',
            }}
        />
    );
};

export default CodeEditor;
