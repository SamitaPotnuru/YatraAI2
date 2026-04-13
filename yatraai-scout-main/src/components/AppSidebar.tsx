import { useLocation, Link } from "react-router-dom";
import {
  Map, CameraAlt as Camera, SmartToy as Brain, AccountBalanceWallet as Wallet,
  People as Users, Cloud, Home, Logout as LogOut, WbSunny as Sun, DarkMode as Moon,
  ChevronLeft, ChevronRight, Hotel, Person, Menu, Close,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { title: t("dashboard"),     path: "/dashboard",          icon: Home   },
    { title: t("landmark_id"),   path: "/dashboard/landmark", icon: Camera },
    { title: t("map_explorer"),  path: "/dashboard/map",      icon: Map    },
    { title: t("weather"),       path: "/dashboard/weather",  icon: Cloud  },
    { title: t("scout_ai"),      path: "/dashboard/scout",    icon: Brain  },
    { title: t("budget"),        path: "/dashboard/budget",   icon: Wallet },
    { title: t("travel_buddy"),  path: "/dashboard/buddy",    icon: Users  },
    { title: t("hotel_bookings"),path: "/dashboard/hotels",   icon: Hotel  },
    { title: t("my_profile"),    path: "/dashboard/profile",  icon: Person },
  ];

  /* ─── Shared nav link (works in both expanded & drawer) ─── */
  const NavLink = ({ item, mini = false }: { item: typeof navItems[0]; mini?: boolean }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        title={mini ? item.title : undefined}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center rounded-xl text-sm font-medium transition-all duration-200 group relative",
          mini
            ? "justify-center w-10 h-10 mx-auto"
            : "gap-3 px-3 py-2.5 w-full",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <item.icon style={{ fontSize: 20 }} className="shrink-0" />
        {!mini && <span className="whitespace-nowrap truncate">{item.title}</span>}
        {/* Tooltip for mini mode */}
        {mini && (
          <span className="absolute left-14 bg-popover text-popover-foreground text-xs font-semibold px-2.5 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-border">
            {item.title}
          </span>
        )}
      </Link>
    );
  };

  /* ─── Mobile drawer content ─────────────────────────────── */
  const DrawerContent = () => (
    <div className="flex flex-col h-full w-72">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border">
        <span className="text-base font-display font-bold text-sidebar-primary">YatraAI Scout</span>
        <button onClick={() => setMobileOpen(false)} className="text-sidebar-foreground/60 hover:text-sidebar-foreground p-1 rounded-lg hover:bg-sidebar-accent transition-colors">
          <Close fontSize="small" />
        </button>
      </div>
      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => <NavLink key={item.path} item={item} />)}
      </nav>
      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <div className="px-2 pb-2">
          <label className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest block mb-1.5">Language</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as any)}
            className="w-full text-xs bg-sidebar-accent/40 border border-sidebar-border rounded-lg px-2 py-1.5 text-sidebar-foreground focus:outline-none cursor-pointer"
          >
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.native}</option>)}
          </select>
        </div>
        <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full transition-colors">
          {theme === "dark" ? <Sun fontSize="small" /> : <Moon fontSize="small" />}
          <span>{theme === "dark" ? t("light_mode") : t("dark_mode")}</span>
        </button>
        <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full transition-colors">
          <LogOut fontSize="small" />
          <span>{t("sign_out")}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ════════════════════════════════════════════════════
          DESKTOP SIDEBAR
      ════════════════════════════════════════════════════ */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 256 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:flex fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40 flex-col overflow-visible"
      >
        {/* Logo row */}
        <div className="h-16 flex items-center border-b border-sidebar-border shrink-0 overflow-hidden">
          {collapsed ? (
            <div className="w-full flex justify-center">
              <Brain style={{ fontSize: 22 }} className="text-sidebar-primary" />
            </div>
          ) : (
            <span className="px-5 text-base font-display font-bold text-sidebar-primary whitespace-nowrap">
              YatraAI Scout
            </span>
          )}
        </div>

        {/* Nav — no scrollbar, icons centred when collapsed */}
        <nav className={cn("flex-1 py-3 overflow-hidden", collapsed ? "px-2 space-y-1" : "px-3 space-y-0.5")}>
          {navItems.map(item =>
            collapsed
              ? <NavLink key={item.path} item={item} mini />
              : <NavLink key={item.path} item={item} />
          )}
        </nav>

        {/* Footer actions */}
        <div className={cn("border-t border-sidebar-border shrink-0", collapsed ? "py-3 px-2 space-y-1" : "p-3 space-y-1")}>
          {/* Language — only in expanded mode */}
          {!collapsed && (
            <div className="px-2 pb-1.5">
              <label className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest block mb-1.5">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as any)}
                className="w-full text-xs bg-sidebar-accent/40 border border-sidebar-border rounded-lg px-2 py-1.5 text-sidebar-foreground focus:outline-none cursor-pointer"
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.native}</option>)}
              </select>
            </div>
          )}

          {/* Theme toggle */}
          {collapsed ? (
            <button title={theme === "dark" ? t("light_mode") : t("dark_mode")} onClick={toggleTheme} className="flex justify-center items-center w-10 h-10 mx-auto rounded-xl text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
              {theme === "dark" ? <Sun style={{ fontSize: 18 }} /> : <Moon style={{ fontSize: 18 }} />}
            </button>
          ) : (
            <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full transition-colors">
              {theme === "dark" ? <Sun fontSize="small" /> : <Moon fontSize="small" />}
              <span>{theme === "dark" ? t("light_mode") : t("dark_mode")}</span>
            </button>
          )}

          {/* Sign out */}
          {collapsed ? (
            <button title={t("sign_out")} onClick={signOut} className="flex justify-center items-center w-10 h-10 mx-auto rounded-xl text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
              <LogOut style={{ fontSize: 18 }} />
            </button>
          ) : (
            <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full transition-colors">
              <LogOut fontSize="small" />
              <span>{t("sign_out")}</span>
            </button>
          )}
        </div>

        {/* Collapse toggle pill */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
        >
          {collapsed ? <ChevronRight style={{ fontSize: 14 }} /> : <ChevronLeft style={{ fontSize: 14 }} />}
        </button>
      </motion.aside>

      {/* ════════════════════════════════════════════════════
          MOBILE — hamburger button
      ════════════════════════════════════════════════════ */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-4 z-50 h-9 w-9 rounded-xl bg-background border border-border shadow-md flex items-center justify-center"
      >
        <Menu fontSize="small" className="text-foreground" />
      </button>

      {/* ════════════════════════════════════════════════════
          MOBILE — slide-out drawer
      ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className="md:hidden fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-50 overflow-hidden"
            >
              <DrawerContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════
          MOBILE — bottom tab bar (5 primary tabs)
      ════════════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border flex items-center justify-around px-1 h-16">
        {navItems.slice(0, 5).map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[9px] font-semibold tracking-wide uppercase transition-colors",
                isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50"
              )}
            >
              <item.icon style={{ fontSize: 20 }} />
              <span className="leading-none">{item.title.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default AppSidebar;
