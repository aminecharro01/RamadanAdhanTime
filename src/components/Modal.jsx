import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

/** Glass overlay panel shared by the tool screens. Closes on Escape or backdrop click. */
const Modal = ({ title, icon: Icon, onClose, children, actions, wide = false, className = '' }) => {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`modal-root fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm ${className}`}
        >
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`modal-panel bg-slate-900/80 backdrop-blur-xl border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} shadow-2xl flex flex-col max-h-[92vh] text-white`}
            >
                <div className="flex justify-between items-center mb-4 gap-3">
                    <h2 className="text-xl font-bold flex items-center gap-2 min-w-0">
                        {Icon && <Icon size={22} className="text-emerald-400 shrink-0" />}
                        <span className="truncate">{title}</span>
                    </h2>
                    <div className="flex items-center gap-2 shrink-0 no-print">
                        {actions}
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain -mx-1 px-1">
                    {children}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Modal;
