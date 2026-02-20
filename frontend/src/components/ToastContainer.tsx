import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import type { Toast } from '../hooks/useToast';

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

const iconMap = {
    success: <CheckCircle2 size={16} className="text-accent-success" />,
    error: <AlertCircle size={16} className="text-red-400" />,
    info: <Info size={16} className="text-accent-primary" />,
};

const borderMap = {
    success: 'border-accent-success/30',
    error: 'border-red-500/30',
    info: 'border-accent-primary/30',
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-14 left-4 z-toast flex flex-col gap-2 pointer-events-none max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 px-4 py-3 bg-bg-secondary/95 backdrop-blur-md border ${borderMap[toast.type]} rounded-xl shadow-2xl pointer-events-auto animate-in slide-in-from-bottom-2 fade-in duration-300`}
                >
                    {iconMap[toast.type]}
                    <span className="text-sm text-text-primary font-medium flex-1">{toast.message}</span>
                    <button
                        onClick={() => onRemove(toast.id)}
                        className="p-0.5 text-text-secondary hover:text-text-primary transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
