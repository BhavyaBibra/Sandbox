import { Play, Pause, SkipForward, SkipBack, RotateCcw, Activity, LayoutGrid, Sparkles, Loader2, GitBranch, Undo2, Layers } from 'lucide-react';

interface TopBarProps {
    onRun: () => void;
    onStep: () => void;
    onReset: () => void;
    onPlayPause: () => void;
    isPlaying: boolean;
    speed: number;
    onSpeedChange: (speed: number) => void;
    canStep: boolean;
    isRunning: boolean; // Backend running state
    hasSnapshots: boolean;
    onStepFunction: () => void;
    onStepLoop: () => void;
    onStepPointer: () => void;
    onStepRecursion: () => void;
    onStepBacktrack: () => void;
    onStepMutation: () => void;
    isRecursive: boolean;
    onOpenGallery: (isDevMode: boolean) => void;
    onToggleChat: () => void;
    onStepBackward: () => void;
    canStepBackward: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
    onRun,
    onStep,
    onReset,
    onPlayPause,
    isPlaying,
    speed,
    onSpeedChange,
    canStep,
    isRunning,
    hasSnapshots,
    onStepFunction,
    onStepLoop,
    onStepPointer,
    onStepRecursion,
    onStepBacktrack,
    onStepMutation,
    isRecursive,
    onOpenGallery,
    onToggleChat,
    onStepBackward,
    canStepBackward
}) => {
    return (
        <div className="h-14 border-b border-border-default bg-bg-secondary flex items-center px-4 justify-between shrink-0">
            {/* Title Section */}
            <div className="flex items-center gap-3">
                <div className="p-1.5 bg-accent-primary/10 rounded-lg border border-accent-primary/20">
                    <Activity size={18} className="text-accent-primary" />
                </div>
                <h1 className="font-bold text-text-primary tracking-tight text-sm">Sandbox</h1>
            </div>

            {/* Controls Section */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-bg-primary/50 p-1 rounded-lg border border-border-default shadow-sm">
                    <button
                        onClick={(e) => onOpenGallery(e.altKey)}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-bg-secondary text-text-secondary hover:text-text-primary text-xs font-bold rounded transition-colors duration-200"
                        title="Open Starter Templates (Hold Alt/Option for Benchmark Suite)"
                    >
                        <LayoutGrid size={14} />
                        Templates
                    </button>

                    <div className="w-px h-6 bg-border-default mx-1" />

                    <button
                        onClick={onRun}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-3 py-1.5 bg-accent-primary hover:bg-accent-primary/90 text-bg-primary text-xs font-bold rounded shadow-md hover:shadow-lg hover:shadow-accent-primary/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {isRunning ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : (
                            <Play size={12} fill="currentColor" />
                        )}
                        {isRunning ? 'Running...' : 'Run'}
                    </button>

                    <div className="w-px h-6 bg-border-default mx-1" />

                    <button
                        onClick={onPlayPause}
                        disabled={!hasSnapshots}
                        className={`p-1.5 rounded hover:bg-border-hover transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${isPlaying ? 'text-accent-primary' : 'text-text-secondary'}`}
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} />}
                    </button>

                    <div className="w-px h-6 bg-border-default mx-1" />

                    <div className="flex items-center gap-1 border-r border-border-default pr-2 mr-1">
                        <button
                            onClick={onStepLoop}
                            disabled={!canStep}
                            className="p-1.5 rounded hover:bg-border-hover text-text-secondary disabled:opacity-30 transition-colors duration-200 group relative"
                            title="Step Loop Iteration"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></svg>
                        </button>

                        <button
                            onClick={onStepFunction}
                            disabled={!canStep}
                            className="p-1.5 rounded hover:bg-border-hover text-text-secondary disabled:opacity-30 transition-colors duration-200 group relative"
                            title="Step Out of Function"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 9-6-6-6 6" /><path d="M12 3v14" /><path d="M5 21h14" /></svg>
                        </button>

                        <button
                            onClick={onStepPointer}
                            disabled={!canStep}
                            className="p-1.5 rounded hover:bg-border-hover text-text-secondary disabled:opacity-30 transition-colors duration-200 group relative"
                            title="Step to Next Pointer/Variable Change"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 20 9-11-9-9-9 9 9 11Z" /><path d="m12 20v4" /></svg>
                        </button>
                    </div>

                    {/* v2 Semantic Stepping — shown when recursion detected */}
                    {isRecursive && (
                        <div className="flex items-center gap-1 border-r border-border-default pr-2 mr-1">
                            <button
                                onClick={onStepRecursion}
                                disabled={!canStep}
                                className="p-1.5 rounded hover:bg-border-hover text-purple-400 disabled:opacity-30 transition-colors duration-200"
                                title="Step Recursion (next depth change)"
                            >
                                <GitBranch size={14} />
                            </button>

                            <button
                                onClick={onStepBacktrack}
                                disabled={!canStep}
                                className="p-1.5 rounded hover:bg-border-hover text-amber-400 disabled:opacity-30 transition-colors duration-200"
                                title="Step Backtrack (next backtrack event)"
                            >
                                <Undo2 size={14} />
                            </button>

                            <button
                                onClick={onStepMutation}
                                disabled={!canStep}
                                className="p-1.5 rounded hover:bg-border-hover text-cyan-400 disabled:opacity-30 transition-colors duration-200"
                                title="Step Mutation Cluster (next multi-variable change)"
                            >
                                <Layers size={14} />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={onStepBackward}
                        disabled={!canStepBackward}
                        className="p-1.5 rounded hover:bg-border-hover text-text-secondary disabled:opacity-30 transition-colors duration-200"
                        title="Step Backward (←)"
                    >
                        <SkipBack size={16} />
                    </button>

                    <button
                        onClick={onStep}
                        disabled={!canStep}
                        className="p-1.5 rounded hover:bg-border-hover text-text-secondary disabled:opacity-30 transition-colors duration-200"
                        title="Step Forward (→)"
                    >
                        <SkipForward size={16} />
                    </button>

                    <button
                        onClick={onReset}
                        className="p-1.5 rounded hover:bg-border-hover text-text-secondary hover:text-accent-warning transition-colors duration-200"
                        title="Reset"
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>

                {/* Speed Slider */}
                <div className="flex items-center gap-2 bg-bg-primary/30 px-3 py-1.5 rounded-lg border border-border-default/50">
                    <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider flex items-center min-w-[60px] justify-between">
                        Speed <span className="text-accent-primary font-mono">{speed}ms</span>
                    </span>
                    <input
                        type="range"
                        min="100"
                        max="1500"
                        step="50"
                        value={speed}
                        onChange={(e) => onSpeedChange(Number(e.target.value))}
                        className="w-20 h-1 bg-border-hover rounded-lg appearance-none cursor-pointer accent-accent-primary"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">

                <button
                    onClick={onToggleChat}
                    className="group flex flex-col items-center justify-center gap-1 min-w-[64px] rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-all duration-200"
                    title="AI Assistant"
                >
                    <Sparkles size={16} className="text-accent-primary" />
                    <span className="font-semibold tracking-wide text-xs">AI Chat</span>
                </button>
            </div>
        </div>
    );
};

export default TopBar;
