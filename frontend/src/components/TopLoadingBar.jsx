import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const TopLoadingBar = () => {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Start loading when location changes
        setIsVisible(true);
        setProgress(30);

        const timer1 = setTimeout(() => setProgress(60), 200);
        const timer2 = setTimeout(() => setProgress(80), 400);

        const timer3 = setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
                setIsVisible(false);
                setProgress(0);
            }, 300);
        }, 600);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [location]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[9999] h-1"
                >
                    <motion.div
                        className="h-full w-full relative overflow-hidden"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        style={{
                            background: 'linear-gradient(90deg, #FF0080, #7928CA, #0070F3, #00DFD8, #FF0080)',
                            backgroundSize: '200% 100%',
                            boxShadow: '0 0 15px rgba(121, 40, 202, 0.6), 0 0 5px rgba(255, 0, 128, 0.4)',
                        }}
                    >
                        {/* Shimmer effect */}
                        <motion.div
                            animate={{
                                x: ['-100%', '200%']
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute inset-0 w-full h-full"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                            }}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TopLoadingBar;
