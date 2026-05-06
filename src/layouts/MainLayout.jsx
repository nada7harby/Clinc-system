import { Outlet, Link } from "react-router-dom";
import { ROUTES } from "@/constants/appConstants";
import { Icon } from "@/components/Icon";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function MainLayout() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Simple Header for Auth/Landing */}
      <header className="flex h-20 items-center justify-between border-b border-slate-100 px-6 lg:px-12">
        <Link to={ROUTES.home} className="flex items-center gap-2">
          <Icon name="faHeartPulse" className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            {t("app.name")}
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            to={ROUTES.login}
            className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
          >
            {t("common.login")}
          </Link>
          <Link
            to={ROUTES.register}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            {t("common.getStarted")}
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-100 py-10 px-6 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Icon name="faHeartPulse" className="h-6 w-6 text-primary" />
            <span className="font-bold text-slate-900">{t("app.name")}</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2024 {t("app.name")}. {t("footer.rights")}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
