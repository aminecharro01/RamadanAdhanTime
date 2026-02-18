import { useTheme } from '../hooks/useTheme';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300"
            aria-label="Toggle Theme"
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                transition={{ duration: 0.5 }}
            >
                {theme === 'dark' ? (
                    <Moon className="w-6 h-6 text-blue-200" />
                ) : (
                    <Sun className="w-6 h-6 text-yellow-500" />
                )}
            </motion.div>
        </button>
    );
};

export default ThemeToggle;
