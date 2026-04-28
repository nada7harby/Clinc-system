import { classNames } from "@/utils";
import { motion } from "framer-motion";

function Card({
  title,
  description,
  children,
  className,
  variant = "premium",
  noPadding = false,
}) {
  const baseClasses = "relative overflow-hidden transition-all duration-500";

  const variantClasses = {
    premium: "surface-card hover:shadow-2xl hover:border-brand-500/15",
    glass: "glass-panel rounded-3xl",
    outline: "bg-transparent border border-slate-200 rounded-3xl",
    flat: "bg-surface-50 rounded-3xl",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={classNames(baseClasses, variantClasses[variant], className)}
    >
      {(title || description) && (
        <div className="border-b border-slate-100/70 px-8 py-6">
          {title && (
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
      )}
      <div className={classNames(noPadding ? "" : "p-8")}>{children}</div>
    </motion.article>
  );
}

export default Card;
