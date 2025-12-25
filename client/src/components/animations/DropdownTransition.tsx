import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownTransitionProps {
    children: ReactNode;
    isOpen: boolean;
    className?: string;
    style?: React.CSSProperties;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const DropdownTransition: React.FC<DropdownTransitionProps> = ({
    children,
    isOpen,
    className = '',
    style,
    onMouseEnter,
    onMouseLeave
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    className={className}
                    style={{ originY: 0, ...style }}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DropdownTransition;
