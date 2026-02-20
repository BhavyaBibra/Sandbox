import React from 'react';

interface TimelineScrubberProps {
    currentStep: number;
    totalSteps: number;
    onStepChange: (step: number) => void;
}

const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
    currentStep,
    totalSteps,
    onStepChange
}) => {
    if (totalSteps <= 0) return null;

    return (
        <div className="h-8 border-b border-border-default bg-bg-primary flex items-center px-4 shrink-0 shadow-sm relative z-elevated">
            <div className="flex-1 flex items-center gap-3">
                <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider w-12 text-right">
                    Timeline
                </span>

                <div className="relative flex-1 group flex items-center h-full">
                    <input
                        type="range"
                        min="0"
                        max={Math.max(0, totalSteps - 1)}
                        value={currentStep}
                        onChange={(e) => onStepChange(Number(e.target.value))}
                        className="w-full h-1.5 bg-border-hover rounded-lg appearance-none cursor-pointer accent-accent-primary relative z-elevated"
                        style={{
                            background: `linear-gradient(to right, rgb(59, 130, 246) ${(currentStep / Math.max(1, totalSteps - 1)) * 100}%, rgba(255, 255, 255, 0.1) ${(currentStep / Math.max(1, totalSteps - 1)) * 100}%)`
                        }}
                    />

                    {/* Tooltip that follows thumb (Optional enhancement, using simple title for now) */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <span className="text-xs text-text-primary font-mono w-16">
                    {currentStep + 1} / {totalSteps}
                </span>
            </div>
        </div>
    );
};

export default TimelineScrubber;
