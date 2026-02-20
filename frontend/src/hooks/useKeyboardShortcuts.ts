import { useEffect } from 'react';

interface ShortcutActions {
    onRun: () => void;
    onPlayPause: () => void;
    onStepForward: () => void;
    onStepBackward: () => void;
    onReset: () => void;
    onToggleChat: () => void;
    onToggleCheatsheet: () => void;
    onEscape: () => void;
}

const useKeyboardShortcuts = (actions: ShortcutActions) => {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const tagName = target.tagName.toLowerCase();

            // Don't fire shortcuts when typing in inputs/textareas
            // But DO fire for Escape and Ctrl combos
            const isTyping = tagName === 'input' || tagName === 'textarea';
            const isMonaco = target.closest('.monaco-editor') !== null;

            // Escape always works
            if (e.key === 'Escape') {
                e.preventDefault();
                actions.onEscape();
                return;
            }

            // Ctrl/Cmd combos work even in editor
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                actions.onRun();
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                actions.onToggleChat();
                return;
            }

            // Skip remaining shortcuts if inside Monaco or input fields
            if (isTyping || isMonaco) return;

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    actions.onPlayPause();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    actions.onStepForward();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    actions.onStepBackward();
                    break;
                case 'r':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        actions.onReset();
                    }
                    break;
                case '?':
                    e.preventDefault();
                    actions.onToggleCheatsheet();
                    break;
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [actions]);
};

export default useKeyboardShortcuts;
