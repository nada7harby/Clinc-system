import { Card, Icon } from "@/components";
import { motion } from "framer-motion";
import { classNames } from "@/utils";

function StatCard({
  title,
  value,
  icon: iconName,
  trend,
  trendValue,
  isLoading,
  variant = "primary",
  layout = "default",
}) {
  const styles = {
    primary: {
      bg: "from-brand-500/10 to-transparent",
      iconBg: "bg-brand-50 border-brand-100",
      iconColor: "text-brand-600",
      glow: "bg-brand-500",
      trendBg: "bg-brand-50",
      trendText: "text-brand-600",
    },
    success: {
      bg: "from-emerald-500/10 to-transparent",
      iconBg: "bg-emerald-50 border-emerald-100",
      iconColor: "text-emerald-600",
      glow: "bg-emerald-500",
      trendBg: "bg-emerald-50",
      trendText: "text-emerald-600",
    },
    warning: {
      bg: "from-amber-500/10 to-transparent",
      iconBg: "bg-amber-50 border-amber-100",
      iconColor: "text-amber-600",
      glow: "bg-amber-500",
      trendBg: "bg-amber-50",
      trendText: "text-amber-600",
    },
    danger: {
      bg: "from-rose-500/10 to-transparent",
      iconBg: "bg-rose-50 border-rose-100",
      iconColor: "text-rose-600",
      glow: "bg-rose-500",
      trendBg: "bg-rose-50",
      trendText: "text-rose-600",
    },
  };

  const currentStyle = styles[variant] || styles.primary;
  const isCompact = layout === "compact";
  const trendBadge = trend ? (
    <div
      className={classNames(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm",
        currentStyle.trendBg,
        currentStyle.trendText,
      )}
    >
      <Icon
        name={trend === "up" ? "faArrowUp" : "faArrowDown"}
        className="text-[9px]"
      />
      {trendValue}
    </div>
  ) : null;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group cursor-pointer"
    >
      <div
        className={classNames(
          "absolute inset-0 rounded-[32px] bg-gradient-to-br opacity-50 transition-opacity duration-500 group-hover:opacity-100",
          currentStyle.bg,
        )}
      ></div>

      <Card
        className={classNames(
          "relative h-full border border-white/40 bg-white/60 p-0 backdrop-blur-xl transition-all duration-500",
          "rounded-[32px] shadow-glass group-hover:shadow-premium group-hover:bg-white overflow-hidden",
        )}
        variant="outline"
      >
        {isCompact ? (
          <div className="p-4 relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                {title}
              </h3>
              {trendBadge}
            </div>
            <div className="mt-3 flex items-center justify-between">
              {isLoading ? (
                <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100"></div>
              ) : (
                <span className="text-2xl font-black tracking-tight text-slate-900 leading-none group-hover:text-brand-700 transition-colors duration-500">
                  {value}
                </span>
              )}
              <div
                className={classNames(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:-rotate-2",
                  currentStyle.iconBg,
                  currentStyle.iconColor,
                )}
              >
                <Icon name={iconName} className="text-base" />
              </div>
            </div>
            <div className="mt-3 text-[10px] font-semibold text-slate-400">
              Compare to previous
            </div>
          </div>
        ) : (
          <div className="p-6 relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  {title}
                </h3>
                {isLoading ? (
                  <div className="mt-2 h-10 w-24 animate-pulse rounded-lg bg-slate-100"></div>
                ) : (
                  <div className="flex items-end gap-3 mt-2">
                    <span className="text-4xl font-black tracking-tighter text-slate-900 leading-none group-hover:text-brand-700 transition-colors duration-500">
                      {value}
                    </span>
                  </div>
                )}
              </div>

              <div
                className={classNames(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3",
                  currentStyle.iconBg,
                  currentStyle.iconColor,
                )}
              >
                <Icon name={iconName} className="text-xl" />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/40 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                Compare to previous
              </span>
              {trendBadge}
            </div>
          </div>
        )}

        {/* Decorative elements */}
        <div
          className={classNames(
            "absolute -right-12 -bottom-12 h-48 w-48 rounded-full blur-3xl opacity-10 transition-opacity duration-500 group-hover:opacity-30",
            currentStyle.glow,
          )}
        ></div>

        <div
          className={classNames(
            "absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-20 transition-all duration-500 group-hover:scale-150",
            currentStyle.glow,
          )}
        ></div>
      </Card>
    </motion.div>
  );
}

export default StatCard;
