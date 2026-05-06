import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { Icon } from "@/components/Icon";
import { motion, AnimatePresence } from "framer-motion";
import { classNames } from "@/utils";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function Navbar() {
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      title: t("notifications.appointmentConfirmed"),
      message: t("notifications.appointmentConfirmedMessage"),
      time: "2m ago",
      read: false,
    },
    {
      id: 2,
      title: t("notifications.newLabResult"),
      message: t("notifications.newLabResultMessage"),
      time: "1h ago",
      read: false,
    },
    {
      id: 3,
      title: t("notifications.systemUpdate"),
      message: t("notifications.systemUpdateMessage"),
      time: "5h ago",
      read: true,
    },
  ];

  return (
    <header className="sticky top-5 z-30 mx-6 mb-8 flex h-20 items-center justify-between rounded-[28px] border border-white/60 bg-white/75 px-8 backdrop-blur-2xl shadow-glass">
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Icon name="faBars" />
        </button>

        <div className="hidden items-center gap-3 rounded-2xl bg-white/80 px-4 py-2.5 lg:flex border border-slate-200/60 shadow-sm focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
          <Icon name="faSearch" className="text-slate-400 text-xs" />
          <input
            type="text"
            placeholder={t("navbar.searchPlaceholder")}
            className="w-64 bg-transparent text-sm font-bold outline-none placeholder:text-slate-400 text-slate-900"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400">
            <span>⌘</span>K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2" ref={notificationRef}>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={classNames(
                "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                showNotifications
                  ? "bg-brand-500 text-white shadow-glow"
                  : "text-slate-500 hover:bg-slate-100",
              )}
            >
              <Icon name="faBell" />
              {!showNotifications && (
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 rounded-3xl bg-white border border-slate-100 shadow-2xl p-4 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                      {t("common.notifications")}
                    </h3>
                    <button className="text-[10px] font-bold text-brand-600 hover:underline">
                      {t("common.markAllRead")}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={classNames(
                          "p-4 rounded-2xl transition-colors cursor-pointer group",
                          n.read
                            ? "opacity-60"
                            : "bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100",
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                            {n.title}
                          </p>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {n.time}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-slate-500 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full py-3 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                    {t("common.viewAllNotifications")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-all"
            aria-label={t("navbar.help")}
          >
            <Icon name="faQuestionCircle" />
          </button>
        </div>

        <LanguageSwitcher />

        <div className="h-8 w-px bg-slate-200/60 mx-1"></div>

        <div className="flex shrink-0 items-center gap-4 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none">
              {user?.name || "User"}
            </p>
            <p className="mt-1.5 text-[10px] font-black text-brand-600 uppercase tracking-widest leading-none">
              {user?.role || "Role"}
            </p>
          </div>
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl border-2 border-brand-100 shadow-lg shadow-brand-500/10 transition-transform group-hover:scale-105">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-brand-50 text-brand-600 font-bold text-lg uppercase">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
