import { Github, Linkedin } from 'lucide-react';

const Footer = ({ t }) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 p-4 flex justify-center items-center z-40 pointer-events-none">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-2 px-6 flex items-center gap-4 shadow-lg pointer-events-auto transition-transform hover:-translate-y-1 duration-300">
                <span className="text-white/80 text-sm font-medium">{t.developedBy}</span>
                <div className="flex items-center gap-3">
                    <a
                        href="https://github.com/aminecharro01/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-emerald-400 transition-colors"
                        aria-label="GitHub"
                    >
                        <Github size={18} />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/charroamine/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-blue-400 transition-colors"
                        aria-label="LinkedIn"
                    >
                        <Linkedin size={18} />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
