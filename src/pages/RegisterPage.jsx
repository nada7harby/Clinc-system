import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useRegister } from "@/hooks/useAuth";
import { Input, Button, Card } from "@/components";
import { ROUTES, ROLES } from "@/constants/appConstants";
import { Icon } from "@/components/Icon";
import { useTranslation } from "react-i18next";

function RegisterPage() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { role: ROLES.PATIENT },
  });
  const { mutate: registerUser, isLoading } = useRegister();

  const onSubmit = (data) => {
    registerUser(data);
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon name="faHeartPulse" className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            {t("auth.createAccount")}
          </h2>
          <p className="mt-2 text-slate-500">{t("auth.joinPlatform")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label={t("auth.fullName")}
            placeholder={t("auth.fullNamePlaceholder")}
            error={errors.name?.message}
            {...register("name", { required: "Name is required" })}
          />

          <Input
            label={t("auth.emailAddress")}
            type="email"
            placeholder={t("auth.emailPlaceholderGeneric")}
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
            })}
          />

          <Input
            label={t("auth.password")}
            type="password"
            placeholder={t("auth.passwordPlaceholder")}
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? t("auth.creatingAccount") : t("auth.register")}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link
            to={ROUTES.login}
            className="font-semibold text-primary hover:underline"
          >
            {t("auth.signIn")}
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default RegisterPage;
