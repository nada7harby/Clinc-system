import { Badge, Card } from "@/components";
import { useTranslation } from "react-i18next";
function DashboardPage() {
  const {
    t
  } = useTranslation();
  return <Card title={t("pages.dashboardpage.dashboardOverview")} description="Replace placeholders with domain modules.">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span>{t("pages.dashboardpage.systemStatus")}</span>
        <Badge tone="success">{t("pages.dashboardpage.ready")}</Badge>
      </div>
    </Card>;
}
export default DashboardPage;
