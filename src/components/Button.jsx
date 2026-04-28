import { classNames } from "@/utils";
import { motion } from "framer-motion";
import { Icon } from "@/components/Icon";

const variantClasses = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/25 active:shadow-inner",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/15",
  accent:
    "bg-accent-soft text-brand-700 hover:bg-brand-100 font-bold border border-brand-500/10",
  success:
    "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/15",
  warning:
    "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/15",
  danger:
    "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/15",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  outline:
    "bg-transparent border-2 border-slate-200 text-slate-700 hover:border-brand-500 hover:text-brand-600",
};

function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  isLoading = false,
  as: Component = "button",
  ...props
}) {
  const sizeClasses =
    {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-base",
    }[size] || "h-11 px-6 text-sm";

  const MotionComponent = motion(Component);

  return (
    <MotionComponent
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={Component === "button" ? type : undefined}
      className={classNames(
        "inline-flex items-center justify-center rounded-2xl font-semibold tracking-tight transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses,
        variantClasses[variant] ?? variantClasses.primary,
        className,
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <Icon
          name="faSpinner"
          className="mr-2 h-4 w-4 animate-spin text-current"
        />
      ) : null}
      {children}
    </MotionComponent>
  );
}

export default Button;
