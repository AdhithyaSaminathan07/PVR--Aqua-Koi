import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg', accent = '#3B82F6' }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10, rotateX: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10, rotateX: 5 }}
                        transition={{ 
                            type: 'spring', 
                            damping: 25, 
                            stiffness: 300,
                            duration: 0.4
                        }}
                        className={`bg-white rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden relative border border-white/20`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Section */}
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between flex-shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h3>
                                <div className="h-1 w-12 rounded-full mt-2" style={{ backgroundColor: accent }}></div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 hover:text-rose-500 transition-all active:scale-95 group"
                            >
                                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
