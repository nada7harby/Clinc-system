import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useLogin } from "@/hooks/useAuth";
import { Input, Button, Card, Icon } from "@/components";
import { ROUTES } from "@/constants/appConstants";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
function LoginPage() {
  const {
    t
  } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm();
  const {
    mutate: login,
    isLoading
  } = useLogin();
  const onSubmit = data => {
    login(data);
  };
  return <div className="flex min-h-screen bg-white font-sans">
      {/* Left: Branding & Form */}
      <div className="flex w-full flex-col justify-center px-6 lg:w-1/2 lg:px-24">
        <div className="mx-auto w-full max-w-md">
          <motion.div initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="mb-12 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 shadow-glow">
              <Icon name="faHeartPulse" className="text-white text-xl" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              {t("app.brand")}
              <span className="text-brand-500">.</span>
            </span>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.1
        }}>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-950">
              {t("auth.welcomeBack")}
            </h2>
            <p className="mt-4 text-lg font-medium text-slate-500">
              {t("auth.signInSubtitle")}
            </p>
          </motion.div>

          <motion.form initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.2
        }} onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
            <Input label={t("auth.professionalEmail")} type="email" placeholder={t("auth.emailPlaceholder")} error={errors.email?.message} {...register("email", {
            required: t("pages.loginpage.professionalEmailIsRequired"),
            pattern: {
              value: /^\S+@\S+$/i,
              message: t("pages.loginpage.pleaseEnterAValidEmail")
            }
          })} />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold tracking-tight text-slate-700 ml-1">
                  {t("auth.securePassword")}
                </label>
                <Link to="#" className="text-xs font-bold text-brand-600 hover:text-brand-700 underline underline-offset-4">
                  {t("auth.resetPassword")}
                </Link>
              </div>
              <Input type="password" placeholder="••••••••" error={errors.password?.message} {...register("password", {
              required: t("pages.loginpage.securePasswordIsRequired")
            })} />
            </div>

            <Button type="submit" className="w-full h-14 text-base" isLoading={isLoading} disabled={isLoading}>
              {t("auth.accessDashboard")}
            </Button>
          </motion.form>

          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.3
        }} className="mt-8 text-center text-sm font-medium text-slate-500">
            {t("auth.newToPlatform")}{" "}
            <Link to={ROUTES.register} className="font-bold text-brand-600 hover:underline">
              {t("auth.requestAccess")}
            </Link>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.4
        }} className="mt-12 rounded-3xl bg-slate-50 p-6 border border-slate-100">
            <p className="text-center text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">
              {t("auth.quickAccess")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button onClick={() => {
              login({
                email: "admin@medicore.com",
                password: "admin123"
              });
            }} className="rounded-xl bg-white p-3 text-[10px] font-bold text-slate-600 shadow-sm border border-slate-100 transition-all hover:border-brand-500 hover:text-brand-600">{t("pages.loginpage.admin")}</button>
              <button onClick={() => {
              login({
                email: "ahmed@medicore.com",
                password: "doctor123"
              });
            }} className="rounded-xl bg-white p-3 text-[10px] font-bold text-slate-600 shadow-sm border border-slate-100 transition-all hover:border-brand-500 hover:text-brand-600">{t("pages.loginpage.doctor")}</button>
              <button onClick={() => {
              login({
                email: "nour@medicore.com",
                password: "receptionist123"
              });
            }} className="rounded-xl bg-white p-3 text-[10px] font-bold text-slate-600 shadow-sm border border-slate-100 transition-all hover:border-brand-500 hover:text-brand-600">{t("pages.loginpage.reception")}</button>
              <button onClick={() => {
              login({
                email: "youssef@email.com",
                password: "patient123"
              });
            }} className="rounded-xl bg-white p-3 text-[10px] font-bold text-slate-600 shadow-sm border border-slate-100 transition-all hover:border-brand-500 hover:text-brand-600">{t("pages.loginpage.patient")}</button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right: Immersive Creative Area */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 lg:items-center lg:justify-center bg-slate-950 overflow-hidden">
        {/* Background Visuals */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-brand-500/20 blur-[120px]"></div>
          <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 text-center px-12">
          <motion.div initial={{
          opacity: 0,
          scale: 0.8
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.8
        }} className="mx-auto mb-10 flex h-32 w-32 items-center justify-center rounded-4xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow animate-float">
            <Icon name="faStethoscope" className="text-6xl text-white opacity-90" />
          </motion.div>
          <motion.h3 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="text-4xl font-bold text-white tracking-tight leading-tight">{t("pages.loginpage.theFutureOf")}<br />{" "}
            <span className="text-brand-400">{t("pages.loginpage.clinicManagement")}</span>{t("pages.loginpage.isHere")}</motion.h3>
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }} className="mt-6 text-xl text-slate-400 font-medium">{t("pages.loginpage.aHighPerformanceWorkspaceDesigned")}<br />{t("pages.loginpage.forHighPerformanceMedicalTeams")}</motion.p>
        </div>

        {/* Decorative Grid */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>
    </div>;
}
export default LoginPage;
