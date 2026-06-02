import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { getNavItems } from "@/constants/navConfig";
import { classNames } from "@/utils";
import { Icon } from "@/components/Icon";
import { useLogout } from "@/hooks/useAuth";
import { Button } from "@/components";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const MotionSpan = motion.span;
const MotionDiv = motion.div;

function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleCollapse } = useUIStore();
  const logout = useLogout();
  const { t } = useTranslation();

  const navItems = getNavItems(user?.role);

  return (
    <aside
      className={classNames(
        "sidebar-shell fixed inset-y-0 z-40 flex flex-col bg-ink-950/95 text-slate-400 transition-all duration-500 ease-in-out",
        sidebarCollapsed ? "w-20" : "w-72",
      )}
    >
      {/* Brand Section */}
      <div className="flex h-20 items-center px-6 border-b border-white/5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 shadow-halo">
          <Icon name="faHeartPulse" className="text-white text-lg" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <MotionSpan
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3 text-xl font-bold text-white tracking-tight"
            >
              {t("app.brand")}
              <span className="text-brand-400">.</span>
            </MotionSpan>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-8">
        {!sidebarCollapsed && (
          <p className="mb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {t("nav.mainMenu")}
          </p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end ?? true}
            className={({ isActive }) =>
              classNames(
                "group relative flex items-center rounded-2xl px-4 py-3 transition-all duration-300",
                isActive
                  ? "bg-white/10 text-white shadow-glass"
                  : "hover:bg-white/5 hover:text-slate-200",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  name={item.icon}
                  className={classNames(
                    "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                    isActive
                      ? "text-brand-400"
                      : "text-slate-500 group-hover:text-slate-300",
                    !sidebarCollapsed && "mr-4",
                  )}
                />
                {!sidebarCollapsed && (
                  <span className="font-medium tracking-tight">
                    {t(item.labelKey || item.label, {
                      defaultValue: item.label,
                    })}
                  </span>
                )}
                {isActive && (
                  <MotionDiv
                    layoutId="sidebar-active"
                    className="absolute left-0 h-6 w-1 rounded-r-full bg-brand-500"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Section */}
      <div className="border-t border-white/5 p-4 space-y-2">
        <button
          onClick={logout}
          className="flex w-full items-center rounded-2xl px-4 py-3 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
        >
          <Icon
            name="faSignOutAlt"
            className={classNames(
              "h-5 w-5 shrink-0",
              !sidebarCollapsed && "mr-4",
            )}
          />
          {!sidebarCollapsed && (
            <span className="font-medium">{t("nav.signOut")}</span>
          )}
        </button>

        {!sidebarCollapsed && (
          <LanguageSwitcher className="w-full justify-center" />
        )}

        <button
          onClick={toggleCollapse}
          className="flex h-10 w-full items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-200 transition-all"
        >
          <Icon
            name={sidebarCollapsed ? "faChevronRight" : "faChevronLeft"}
            size="sm"
          />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
