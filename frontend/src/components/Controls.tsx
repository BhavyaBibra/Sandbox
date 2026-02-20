import React from 'react';
import { Play, StepForward, RotateCcw } from 'lucide-react';

interface ControlsProps {
    onRun: () => void;
    onStep: () => void;
    onReset: () => void;
    canRun: boolean;
    canStep: boolean;
    isReset: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onRun, onStep, onReset, canRun, canStep, isReset }) => {
    return (
        <div style={{ display: 'flex', gap: '10px', padding: '10px', background: '#f0f0f0', borderTop: '1px solid #ccc' }}>
            <button onClick={onRun} disabled={!canRun} style={btnStyle}>
                <Play size={16} /> Run
            </button>
            <button onClick={onStep} disabled={!canStep} style={btnStyle}>
                <StepForward size={16} /> Step
            </button>
            <button onClick={onReset} disabled={!isReset && !canRun} style={btnStyle}>
                <RotateCcw size={16} /> Reset
            </button>
        </div>
    );
};

const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 16px',
    cursor: 'pointer',
    border: '1px solid #999',
    borderRadius: '4px',
    background: 'white'
};

export default Controls;
