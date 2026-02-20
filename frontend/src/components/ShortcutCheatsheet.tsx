import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutCheatsheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const shortcuts = [
    { keys: ['Ctrl', 'Enter'], action: 'Run code' },
    { keys: ['Space'], action: 'Play / Pause playback' },
    { keys: ['→'], action: 'Step forward' },
    { keys: ['←'], action: 'Step backward' },
    { keys: ['R'], action: 'Reset execution' },
    { keys: ['Ctrl', '/'], action: 'Toggle AI Chat' },
    { keys: ['Esc'], action: 'Close panel / modal' },
    { keys: ['?'], action: 'Toggle this cheatsheet' },
];

const ShortcutCheatsheet: React.FC<ShortcutCheatsheetProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-modal flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="w-full max-w-md rounded-xl bg-bg-secondary border border-border-default shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-border-default flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-accent-primary/10 rounded-lg border border-accent-primary/20">
                            <Keyboard size={18} className="text-accent-primary" />
                        </div>
                        <h2 className="text-base font-bold text-text-primary tracking-tight">Keyboard Shortcuts</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-primary rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Shortcuts List */}
                <div className="p-4 space-y-1">
                    {shortcuts.map((shortcut, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-bg-primary/50 transition-colors"
                        >
                            <span className="text-sm text-text-secondary">{shortcut.action}</span>
                            <div className="flex items-center gap-1">
                                {shortcut.keys.map((key, j) => (
                                    <React.Fragment key={j}>
                                        {j > 0 && <span className="text-text-secondary text-xs mx-0.5">+</span>}
                                        <kbd className="px-2 py-1 bg-bg-primary border border-border-default rounded-md text-xs font-mono text-text-primary shadow-sm min-w-[28px] text-center">
                                            {key}
                                        </kbd>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-border-default bg-bg-primary/30">
                    <p className="text-[11px] text-text-secondary text-center">
                        Press <kbd className="px-1.5 py-0.5 bg-bg-primary border border-border-default rounded text-[10px] font-mono">?</kbd> to toggle this panel
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShortcutCheatsheet;
