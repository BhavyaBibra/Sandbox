import React from 'react';
import { Play, Pause, SkipBack, FastForward } from 'lucide-react';

interface ReplayControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onStepBack: () => void;
    onStepForward: () => void;
    speed: number;
    onSpeedChange: (speed: number) => void;
    canStepBack: boolean;
    canStepForward: boolean;
}

const ReplayControls: React.FC<ReplayControlsProps> = ({
    isPlaying,
    onPlayPause,
    onStepBack,
    onStepForward,
    speed,
    onSpeedChange,
    canStepBack,
    canStepForward
}) => {
    return (
        <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <button
                onClick={onStepBack}
                disabled={!canStepBack}
                className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-30"
                title="Step Back"
            >
                <SkipBack size={20} />
            </button>

            <button
                onClick={onPlayPause}
                className={`p-2 rounded-full ${isPlaying ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'} hover:opacity-80 transition-colors`}
                title={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>

            <button
                onClick={onStepForward}
                disabled={!canStepForward}
                className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-30"
                title="Step Forward"
            >
                <FastForward size={20} />
            </button>

            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Speed: {speed}ms</span>
                <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={speed}
                    onChange={(e) => onSpeedChange(Number(e.target.value))}
                    className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
            </div>
        </div>
    );
};

export default ReplayControls;
