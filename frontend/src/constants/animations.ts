export const SPRING_TRANSITION = {
    type: 'spring',
    stiffness: 300,
    damping: 25,
};

export const SMOOTH_TRANSITION = {
    duration: 0.3,
    ease: 'easeInOut' as const, // Explicitly type as literal
};

// For pointers sliding
export const POINTER_TRANSITION = SMOOTH_TRANSITION;

// For nodes appearing/disappearing
export const NODE_TRANSITION = {
    type: 'spring' as const, // Explicitly type as literal
    stiffness: 300,
    damping: 25,
    opacity: { duration: 0.2 },
    scale: { duration: 0.2 },
};

// For node circle flash (SVG properties)
export const NODE_FLASH_VARIANTS = {
    initial: { fill: '#1F2937', stroke: '#30363D' }, // bg-gray-800, border-gray-700
    flash: { fill: '#E0AF68', stroke: '#E0AF68' },   // accent-warning
};

// For text color flash (SVG properties)
export const TEXT_FLASH_VARIANTS = {
    initial: { fill: '#E6EDF3' }, // text-primary
    flash: { fill: '#0B0F17' },   // bg-primary (dark text on warning bg)
};
