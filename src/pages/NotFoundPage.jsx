import { Link } from "react-router-dom";
import { Button, Card } from "@/components";
import { useTranslation } from "react-i18next";
function NotFoundPage() {
  const {
    t
  } = useTranslation();
  return <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-md text-center" title={t("pages.notfoundpage.pageNotFound")}>
        <p className="mb-6 text-sm text-slate-600">{t("pages.notfoundpage.thePageYouAreLookingForDoes")}</p>
        <Link to="/">
          <Button>{t("pages.notfoundpage.backToHome")}</Button>
        </Link>
      </Card>
    </div>;
}
export default NotFoundPage;
