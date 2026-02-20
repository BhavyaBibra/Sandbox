import { useState, useCallback, useRef } from 'react';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

const useToast = (autoDismissMs: number = 3000) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const counterRef = useRef(0);

    const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
        const id = `toast-${++counterRef.current}`;
        const toast: Toast = { id, message, type };
        setToasts(prev => [...prev, toast]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, autoDismissMs);
    }, [autoDismissMs]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, addToast, removeToast };
};

export default useToast;
