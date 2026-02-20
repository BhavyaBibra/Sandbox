import { useState, useEffect, useRef, useCallback } from 'react';

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'completed';

interface UsePlaybackControllerProps {
    totalSteps: number;
    initialSpeed?: number;
}

interface UsePlaybackControllerReturn {
    currentStep: number;
    playbackState: PlaybackState;
    speed: number;
    play: () => void;
    pause: () => void;
    stepForward: () => void;
    stepBack: () => void;
    reset: () => void;
    setSpeed: (speed: number) => void;
    setCurrentStep: (step: number) => void;
    replayCrash: () => void;
}

export const usePlaybackController = ({
    totalSteps,
    initialSpeed = 500
}: UsePlaybackControllerProps): UsePlaybackControllerReturn => {
    const [currentStep, setCurrentStep] = useState<number>(-1);
    const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
    const [speed, setSpeed] = useState<number>(initialSpeed);
    const timerRef = useRef<number | null>(null);

    // Clean up timer on unmount or when state changes
    useEffect(() => {
        return () => {
            if (timerRef.current !== null) {
                window.clearInterval(timerRef.current);
            }
        };
    }, []);

    // Core playback loop
    useEffect(() => {
        if (playbackState === 'playing') {
            // Clear existing timer if speed changes while playing
            if (timerRef.current !== null) {
                window.clearInterval(timerRef.current);
            }

            timerRef.current = window.setInterval(() => {
                setCurrentStep((prev) => {
                    const nextStep = prev + 1;
                    if (nextStep >= totalSteps - 1) {
                        setPlaybackState('completed');
                        window.clearInterval(timerRef.current!);
                        timerRef.current = null;
                        return totalSteps - 1;
                    }
                    return nextStep;
                });
            }, speed);
        } else {
            if (timerRef.current !== null) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [playbackState, speed, totalSteps]);

    // Actions
    const play = useCallback(() => {
        if (totalSteps > 0 && currentStep < totalSteps - 1) {
            setPlaybackState('playing');
        } else if (currentStep >= totalSteps - 1) {
            // If at the end, restart and play
            setCurrentStep(0);
            setPlaybackState('playing');
        }
    }, [totalSteps, currentStep]);

    const pause = useCallback(() => {
        if (playbackState === 'playing') {
            setPlaybackState('paused');
        }
    }, [playbackState]);

    const stepForward = useCallback(() => {
        pause();
        setCurrentStep((prev) => {
            const next = prev < totalSteps - 1 ? prev + 1 : prev;
            if (next === totalSteps - 1) setPlaybackState('completed');
            else setPlaybackState('paused');
            return next;
        });
    }, [totalSteps, pause]);

    const stepBack = useCallback(() => {
        pause();
        setCurrentStep((prev) => {
            const next = prev > 0 ? prev - 1 : 0;
            setPlaybackState('paused');
            return next;
        });
    }, [pause]);

    const reset = useCallback(() => {
        pause();
        setCurrentStep(-1);
        setPlaybackState('idle');
    }, [pause]);

    const replayCrash = useCallback(() => {
        if (totalSteps > 0) {
            pause(); // Clear any existing
            const targetStep = Math.max(0, totalSteps - 5);
            setCurrentStep(targetStep);

            // Allow a small tick for the state to jump, then play
            setTimeout(() => {
                setSpeed(1000); // Slow down for replay
                setPlaybackState('playing');
            }, 50);
        }
    }, [totalSteps, pause]);

    // Allow external override of current step (e.g. from a slider or on initial load)
    const handleSetCurrentStep = useCallback((step: number) => {
        setCurrentStep(step);
        if (step === totalSteps - 1) {
            setPlaybackState('completed');
        } else if (playbackState !== 'playing') {
            // Keep playing if it was playing, else pause. 
            // Normally manual dragging pauses, but if we just jumped, we might want to stay paused.
            // We'll enforce a pause on manual jump for now.
            setPlaybackState('paused');
        }
    }, [totalSteps, playbackState]);


    return {
        currentStep,
        playbackState,
        speed,
        play,
        pause,
        stepForward,
        stepBack,
        reset,
        setSpeed,
        setCurrentStep: handleSetCurrentStep,
        replayCrash,
    };
};
