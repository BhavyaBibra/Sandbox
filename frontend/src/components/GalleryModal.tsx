import React from 'react';
import { STARTER_TEMPLATES, BENCHMARK_SUITE } from '../constants/gallery';
import type { Template } from '../constants/gallery';
import { X, Code2, FlaskConical } from 'lucide-react';

interface GalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (code: string) => void;
    isDevMode: boolean;
}

const GalleryModal: React.FC<GalleryModalProps> = ({
    isOpen,
    onClose,
    onSelectTemplate,
    isDevMode
}) => {
    if (!isOpen) return null;

    const templates = isDevMode ? BENCHMARK_SUITE : STARTER_TEMPLATES;
    const title = isDevMode ? 'Developer Benchmark Suite' : 'Starter Templates';
    const subtitle = isDevMode
        ? 'Hidden stress tests for visualizer edge cases.'
        : 'Select an algorithm to instantly trace its execution.';

    return (
        <div className="fixed inset-0 z-modal flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className={`w-full max-w-3xl rounded-xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${isDevMode ? 'bg-[#1e111a] border-[#5c2a44]' : 'bg-bg-secondary border-border-default'
                    }`}
            >
                {/* Header */}
                <div className={`p-6 border-b flex items-center justify-between ${isDevMode ? 'border-[#5c2a44]/50' : 'border-border-default'
                    }`}>
                    <div>
                        <h2 className={`text-xl font-bold flex items-center gap-2 ${isDevMode ? 'text-[#f472b6]' : 'text-text-primary'
                            }`}>
                            {isDevMode ? <FlaskConical size={24} /> : <Code2 size={24} className="text-accent-primary" />}
                            {title}
                        </h2>
                        <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-primary rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Grid Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map((template: Template) => (
                            <div
                                key={template.id}
                                onClick={() => onSelectTemplate(template.code)}
                                className={`group p-5 rounded-lg border flex flex-col cursor-pointer transition-all duration-200 ${isDevMode
                                    ? 'bg-[#1e111a] border-[#5c2a44]/50 hover:border-[#f472b6] hover:bg-[#301c2a]'
                                    : 'bg-bg-primary border-border-default hover:border-accent-primary/50 hover:bg-border-hover/50'
                                    }`}
                            >
                                <h3 className={`font-semibold mb-2 ${isDevMode ? 'group-hover:text-[#f472b6]' : 'group-hover:text-accent-primary'
                                    } transition-colors`}>
                                    {template.title}
                                </h3>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    {template.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GalleryModal;
