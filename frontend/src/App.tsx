import { useState, useMemo } from 'react';
import axios from 'axios';
import CodeEditor from './components/CodeEditor';
import VisualizationCanvas from './components/VisualizationCanvas';
import PatternFeedback from './components/PatternFeedback';
import WorkspaceLayout from './components/WorkspaceLayout';
import TopBar from './components/TopBar';
import StatusBar from './components/StatusBar';
import TimelineScrubber from './components/TimelineScrubber';
import GalleryModal from './components/GalleryModal';
import ShortcutCheatsheet from './components/ShortcutCheatsheet';
import ToastContainer from './components/ToastContainer';
import ConsoleOutput from './components/ConsoleOutput';
import { usePlaybackController } from './hooks/usePlaybackController';
import { useSemanticStepping } from './hooks/useSemanticStepping';
import { useInsightEngine } from './hooks/useInsightEngine';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import useToast from './hooks/useToast';
import ChatPanel from './components/ChatPanel';
import './App.css';

interface TraceStep {
  line: number;
  event: string;
  func_name: string;
  stack: any[];
  objects: Record<string, any>;
  exception?: string;
}

interface PatternData {
  pattern: string;
  confidence: number;
  tests: string[];
}

const DEFAULT_CODE = `
def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]: return False
        left += 1
        right -= 1
    return True

is_palindrome("racecar")
`.trim();

function App() {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pattern, setPattern] = useState<PatternData | undefined>(undefined);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);

  // Gallery State
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isGalleryDevMode, setIsGalleryDevMode] = useState<boolean>(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Cheatsheet State
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState<boolean>(false);

  // Toast System
  const { toasts, addToast, removeToast } = useToast(3500);

  // Playback Controller
  const {
    currentStep,
    playbackState,
    speed,
    play,
    pause,
    stepForward,
    reset: resetPlayback,
    setSpeed,
    setCurrentStep,
    replayCrash
  } = usePlaybackController({
    totalSteps: trace.length,
    initialSpeed: 500
  });

  // Semantic Stepping
  const { stepFunction, stepLoop, stepPointer } = useSemanticStepping({
    trace,
    currentStep,
    setCurrentStep,
    pause
  });

  const handleRun = async (overrideCode?: string) => {
    setIsRunning(true);
    setError(null);
    setTrace([]);
    resetPlayback();
    setPattern(undefined);
    setConsoleOutput(null);

    const codeToRun = typeof overrideCode === 'string' ? overrideCode : code;

    try {
      const response = await axios.post('http://127.0.0.1:8000/run', { code: codeToRun });
      if (response.data.error) {
        setError(response.data.error);
        addToast('Execution failed — see error below', 'error');
        setIsRunning(false);
      } else {
        setTrace(response.data.trace);
        if (response.data.pattern) {
          setPattern(response.data.pattern);
        }
        if (response.data.output) {
          setConsoleOutput(response.data.output);
        }
        if (response.data.trace.length > 0) {
          // Always start at step 0 — the error field from the backend
          // is the authoritative source for crash detection, not the trace data
          setCurrentStep(0);
          addToast(`Traced ${response.data.trace.length} steps successfully`, 'success');
        }
        setIsRunning(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to backend");
      addToast('Failed to connect to backend', 'error');
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    resetPlayback();
    setTrace([]);
    setError(null);
    setPattern(undefined);
    setConsoleOutput(null);
    addToast('Execution reset', 'info');
  };

  const handleApplyTest = (testCode: string) => {
    setCode(prev => prev + "\n\n" + testCode);
  };

  const handleOpenGallery = (isDevMode: boolean) => {
    setIsGalleryDevMode(isDevMode);
    setIsGalleryOpen(true);
  };

  const handleSelectTemplate = (templateCode: string) => {
    setCode(templateCode);
    setIsGalleryOpen(false);
    // Add a slight delay to allow the editor/state to update visually before locking in the run state
    setTimeout(() => {
      handleRun(templateCode);
    }, 50);
  };

  const currentTraceItem = trace.length > 0 && currentStep >= 0 ? trace[currentStep] : null;
  const highlightLine = currentTraceItem ? currentTraceItem.line : null;

  const insights = useInsightEngine(trace, currentStep, code);

  const hasCrashed = trace.length > 0 && !!trace[trace.length - 1].exception;
  const crashMessage = hasCrashed ? trace[trace.length - 1].exception : null;
  const crashLine = hasCrashed && currentStep === trace.length - 1 ? trace[trace.length - 1].line : null;

  // Determine Execution State
  let executionState: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' = 'IDLE';
  if (trace.length > 0) {
    if (playbackState === 'completed') executionState = 'COMPLETED';
    else if (playbackState === 'playing') executionState = 'RUNNING';
    else executionState = 'PAUSED';
  }

  // Keyboard Shortcuts
  const shortcutActions = useMemo(() => ({
    onRun: () => handleRun(),
    onPlayPause: () => {
      if (playbackState === 'playing') pause();
      else play();
    },
    onStepForward: () => {
      if (currentStep < trace.length - 1) stepForward();
    },
    onStepBackward: () => {
      if (currentStep > 0) setCurrentStep(currentStep - 1);
    },
    onReset: handleReset,
    onToggleChat: () => setIsChatOpen(prev => !prev),
    onToggleCheatsheet: () => setIsCheatsheetOpen(prev => !prev),
    onEscape: () => {
      if (isCheatsheetOpen) setIsCheatsheetOpen(false);
      else if (isGalleryOpen) setIsGalleryOpen(false);
      else if (isChatOpen) setIsChatOpen(false);
    },
  }), [playbackState, currentStep, trace.length, isCheatsheetOpen, isGalleryOpen, isChatOpen]);

  useKeyboardShortcuts(shortcutActions);

  return (
    <div className={`h-full w-full ${isChatOpen ? 'chat-open' : ''}`}>
      <ShortcutCheatsheet isOpen={isCheatsheetOpen} onClose={() => setIsCheatsheetOpen(false)} />
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        isDevMode={isGalleryDevMode}
      />
      <WorkspaceLayout
        topBar={
          <div className="flex flex-col shrink-0">
            <TopBar
              onRun={handleRun}
              onStep={stepForward}
              onStepBackward={() => { if (currentStep > 0) setCurrentStep(currentStep - 1); }}
              onReset={handleReset}
              onPlayPause={() => {
                if (playbackState === 'playing') pause();
                else play();
              }}
              isPlaying={playbackState === 'playing'}
              speed={speed}
              onSpeedChange={setSpeed}
              canStep={currentStep < trace.length - 1}
              canStepBackward={currentStep > 0}
              isRunning={isRunning}
              hasSnapshots={trace.length > 0}
              onStepFunction={stepFunction}
              onStepLoop={stepLoop}
              onStepPointer={stepPointer}
              onOpenGallery={handleOpenGallery}
              onToggleChat={() => setIsChatOpen(!isChatOpen)}
            />
            {hasCrashed && currentStep === trace.length - 1 && (
              <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-between text-sm shadow-sm">
                <span className="text-red-400 font-mono"><strong className="font-bold uppercase tracking-wider text-xs mr-2">Runtime Error</strong> {crashMessage}</span>
                <button
                  onClick={replayCrash}
                  className="flex items-center gap-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                  Replay Crash
                </button>
              </div>
            )}
          </div>
        }
        timelineScrubber={
          <TimelineScrubber
            currentStep={currentStep}
            totalSteps={trace.length}
            onStepChange={setCurrentStep}
          />
        }
        statusBar={
          <StatusBar
            currentStep={currentStep}
            totalSteps={trace.length}
            pattern={pattern}
            executionState={executionState}
          />
        }
        editorPane={
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 min-h-0 relative">
              <CodeEditor
                code={code}
                onChange={(val) => setCode(val || '')}
                highlightLine={highlightLine}
                crashLine={crashLine}
              />
            </div>
            {/* Collapsible Feedback Area */}
            <div className={`transition-all duration-300 ${pattern || error ? 'max-h-64 border-t border-zinc-900 bg-zinc-900' : 'max-h-0 overflow-hidden'}`}>
              {pattern && (
                <div className="p-4">
                  <PatternFeedback
                    pattern={pattern}
                    onApplyTest={handleApplyTest}
                  />
                </div>
              )}
              {error && (
                <div className="p-4 bg-zinc-900">
                  <div className="bg-red-900/20 text-red-400 p-3 rounded border border-red-900/50 text-xs font-mono">
                    {error}
                  </div>
                </div>
              )}
            </div>
            {/* Console Output */}
            <ConsoleOutput output={consoleOutput} />
          </div>
        }
        visualizationPane={
          <VisualizationCanvas traceStep={currentTraceItem} insights={insights} onRun={handleRun} isRunning={isRunning} trace={trace} currentStep={currentStep} />
        }
        chatPanel={
          <ChatPanel
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            context={{
              code: code,
              currentLine: highlightLine || undefined,
              locals: currentTraceItem && currentTraceItem.stack.length > 0 ? currentTraceItem.stack[0].locals : {},
              insights: insights,
              pattern: pattern?.pattern
            }}
          />
        }
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
