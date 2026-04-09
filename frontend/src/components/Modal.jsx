import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`bg-white rounded-3xl shadow-2xl w-full ${maxWidth} max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300`}>
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-xl font-bold text-gray-900 font-display">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-0 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
