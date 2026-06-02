import { Card, Icon } from "@/components";
import { motion } from "framer-motion";
import { classNames } from "@/utils";
import { useTranslation } from "react-i18next";
function StatCard({
  title,
  value,
  icon: iconName,
  trend,
  trendValue,
  isLoading,
  variant = "primary",
  layout = "default"
}) {
  const {
    t
  } = useTranslation();
  const styles = {
    primary: {
      bg: "from-brand-500/10 to-transparent",
      iconBg: "bg-brand-50 border-brand-100",
      iconColor: "text-brand-600",
      glow: "bg-brand-500",
      trendBg: "bg-brand-50 border-brand-100/50",
      trendText: "text-brand-600"
    },
    success: {
      bg: "from-emerald-500/10 to-transparent",
      iconBg: "bg-emerald-50 border-emerald-100",
      iconColor: "text-emerald-600",
      glow: "bg-emerald-500",
      trendBg: "bg-emerald-50 border-emerald-100/50",
      trendText: "text-emerald-600"
    },
    warning: {
      bg: "from-amber-500/10 to-transparent",
      iconBg: "bg-amber-50 border-amber-100",
      iconColor: "text-amber-600",
      glow: "bg-amber-500",
      trendBg: "bg-amber-50 border-amber-100/50",
      trendText: "text-amber-600"
    },
    danger: {
      bg: "from-rose-500/10 to-transparent",
      iconBg: "bg-rose-50 border-rose-100",
      iconColor: "text-rose-600",
      glow: "bg-rose-500",
      trendBg: "bg-rose-50 border-rose-100/50",
      trendText: "text-rose-600"
    }
  };
  const currentStyle = styles[variant] || styles.primary;
  const isCompact = layout === "compact";
  const trendBadge = trend ? <div className={classNames("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm shrink-0", currentStyle.trendBg, currentStyle.trendText)}>
      <Icon name={trend === "up" ? "faArrowUp" : "faArrowDown"} className="text-[8px]" />
      {trendValue}
    </div> : null;
  return <motion.div whileHover={{
    y: -4,
    scale: 1.01
  }} transition={{
    type: "spring",
    stiffness: 400,
    damping: 25
  }} className="relative group cursor-pointer h-full">
      {/* Premium Glass Hover Glow */}
      <div className={classNames("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-sm -z-10", currentStyle.bg)}></div>

      <Card className={classNames("relative h-full border border-slate-100 bg-white/70 backdrop-blur-md transition-all duration-500 overflow-hidden", "rounded-2xl shadow-sm hover:shadow-lg hover:border-slate-200/60 hover:bg-white p-0")} variant="outline">
        {isCompact ? (/* COMPACT LAYOUT: Tight padding, value right below title, trend next to base text at the bottom row */
      <div className="p-3.5 relative z-10 flex flex-col justify-between h-full min-h-[112px]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate pr-1" title={title}>
                  {title}
                </h3>
                {isLoading ? <div className="h-6 w-16 animate-pulse rounded-lg bg-slate-100"></div> : <span className="text-2xl font-black tracking-tight text-slate-950 leading-none group-hover:text-brand-600 transition-colors duration-300 block">
                    {value}
                  </span>}
              </div>
              
              <div className={classNames("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", currentStyle.iconBg, currentStyle.iconColor)}>
                <Icon name={iconName} className="text-xs" />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {trendBadge}
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{t("features.dashboard.statcard.vsPrevious")}</span>
            </div>
          </div>) : (/* STANDARD LAYOUT: Improved spacing and distribution, value right below title */
      <div className="p-4.5 relative z-10 flex flex-col h-full justify-between min-h-[140px]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                  {title}
                </h3>
                {isLoading ? <div className="h-7 w-20 animate-pulse rounded-lg bg-slate-100"></div> : <span className="text-2xl.5 font-black tracking-tight text-slate-950 leading-none group-hover:text-brand-600 transition-colors duration-300 block">
                    {value}
                  </span>}
              </div>

              <div className={classNames("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3", currentStyle.iconBg, currentStyle.iconColor)}>
                <Icon name={iconName} className="text-sm" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100/60 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{t("features.dashboard.statcard.vsPreviousPeriod")}</span>
              {trendBadge}
            </div>
          </div>)}

        {/* Dynamic Abstract Visual Gradients */}
        <div className={classNames("absolute -right-16 -bottom-16 h-36 w-36 rounded-full blur-3xl opacity-5 transition-opacity duration-500 group-hover:opacity-20 pointer-events-none -z-10", currentStyle.glow)}></div>
      </Card>
    </motion.div>;
}
export default StatCard;
