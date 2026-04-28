import { forwardRef } from "react";
import { classNames } from "@/utils";
import { Icon } from "@/components/Icon";

const Input = forwardRef(function Input(
  { label, error, className, id, ...props },
  ref,
) {
  return (
    <div className="w-full space-y-2">
      {label ? (
        <label
          htmlFor={id}
          className="text-sm font-bold tracking-tight text-slate-700 ml-1"
        >
          {label}
        </label>
      ) : null}
      <div className="relative group">
        <input
          id={id}
          ref={ref}
          className={classNames(
            "h-12 w-full rounded-2xl border-2 border-slate-100 bg-white/70 px-4 text-sm font-medium transition-all duration-300 outline-none",
            "placeholder:text-slate-400",
            "hover:border-slate-200",
            "focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10",
            error
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
              : "",
            className,
          )}
          {...props}
        />
        {error && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500">
            <Icon name="faTriangleExclamation" className="h-5 w-5" />
          </div>
        )}
      </div>
      {error ? (
        <p className="ml-1 text-xs font-bold text-rose-500 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
