import { motion } from 'framer-motion';

const Loader = ({ text }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-full space-y-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full"
            />
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                className="text-white/60 font-medium tracking-widest text-sm uppercase"
            >
                {text || "Locating & Syncing"}
            </motion.p>
        </div>
    );
};

export default Loader;
