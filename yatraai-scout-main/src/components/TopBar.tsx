import { Translate, ExpandMore } from "@mui/icons-material";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { WbSunny as Sun, DarkMode as Moon, NotificationsNone } from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TopBar = () => {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === language)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 md:left-[260px] h-14 z-30 flex items-center justify-end px-4 md:px-6 gap-2 md:gap-3 bg-background/95 border-b border-border/60 pl-16 md:pl-6">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        title="Toggle theme"
      >
        {theme === "dark" ? <Sun fontSize="small" /> : <Moon fontSize="small" />}
      </button>

      {/* Notification Bell (static) */}
      <button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground relative">
        <NotificationsNone fontSize="small" />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
      </button>

      {/* Language Picker */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 h-8 px-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium text-foreground"
        >
          <Translate fontSize="small" className="text-primary" />
          <span className="font-semibold">{current.native}</span>
          <ExpandMore fontSize="small" className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 w-44 rounded-xl border border-border bg-background shadow-2xl overflow-hidden z-50"
            >
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code as any); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-muted ${
                    lang.code === language ? "bg-primary/5 text-primary font-bold" : "text-foreground"
                  }`}
                >
                  <span>{lang.native}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{lang.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Avatar */}
      <div className="h-8 w-8 rounded-full gradient-primary-bg flex items-center justify-center text-sm font-bold text-primary-foreground shadow-sm">
        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "?"}
      </div>
    </header>
  );
};

export default TopBar;
