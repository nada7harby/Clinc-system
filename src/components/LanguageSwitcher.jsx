import { useTranslation } from "react-i18next";
import { languageOptions } from "@/i18n";
import { classNames } from "@/utils";

function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation();

  return (
    <div
      className={classNames(
        "flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500",
        className,
      )}
    >
      {languageOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => i18n.changeLanguage(option.value)}
          className={classNames(
            "rounded-full px-2.5 py-1 transition-all",
            i18n.language === option.value
              ? "bg-slate-950 text-white"
              : "text-slate-500 hover:bg-slate-100",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
