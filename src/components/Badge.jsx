import { classNames } from "@/utils";

const toneClasses = {
  primary: "bg-brand-500/12 text-brand-700",
  secondary: "bg-slate-900/10 text-slate-700",
  success: "bg-emerald-500/10 text-emerald-700",
  warning: "bg-amber-500/12 text-amber-700",
  danger: "bg-rose-500/12 text-rose-700",
};

function Badge({ tone = "primary", className, children }) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone] ?? toneClasses.primary,
        className,
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
