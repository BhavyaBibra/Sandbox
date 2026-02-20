import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { NODE_TRANSITION, NODE_FLASH_VARIANTS, TEXT_FLASH_VARIANTS } from '../constants/animations';

interface ArrayNodeProps {
    value: any;
    index?: number;
    xPos: number;
    yPos: number;
    size: number;
    shape?: 'circle' | 'square';
    showIndex?: boolean;
}

const ArrayNode: React.FC<ArrayNodeProps> = ({
    value,
    index,
    xPos,
    yPos,
    size,
    shape = 'circle',
    showIndex = true
}) => {
    const controls = useAnimation();

    // Detect value changes and trigger flash animation
    useEffect(() => {
        controls.start('flash').then(() => {
            controls.start('initial');
        });
    }, [value, controls]);

    return (
        <motion.g
            layout
            initial={{ opacity: 0, scale: 0.5, x: xPos, y: yPos }}
            animate={{ opacity: 1, scale: 1, x: xPos, y: yPos }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={NODE_TRANSITION}
        >
            {/* Node Shape */}
            {shape === 'circle' ? (
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 2}
                    strokeWidth="2"
                    className="cursor-pointer"
                    variants={NODE_FLASH_VARIANTS}
                    initial="initial"
                    animate={controls}
                />
            ) : (
                <motion.rect
                    width={size}
                    height={size}
                    rx={4} // Rounded corners
                    strokeWidth="2"
                    className="cursor-pointer"
                    variants={NODE_FLASH_VARIANTS}
                    initial="initial"
                    animate={controls}
                />
            )}

            {/* Value Text */}
            <motion.text
                x={size / 2}
                y={size / 2}
                dy=".3em"
                textAnchor="middle"
                fontSize={shape === 'square' ? "16" : "18"}
                fontWeight="600"
                fontFamily="monospace"
                variants={TEXT_FLASH_VARIANTS}
                initial="initial"
                animate={controls}
            >
                {String(value)}
            </motion.text>

            {/* Index Label */}
            {showIndex && index !== undefined && (
                <text
                    x={size / 2}
                    y={size + 20}
                    textAnchor="middle"
                    fill="#8B949E" // text-secondary
                    fontSize="12"
                    fontFamily="monospace"
                >
                    {index}
                </text>
            )}
        </motion.g>
    );
};

export default ArrayNode;
