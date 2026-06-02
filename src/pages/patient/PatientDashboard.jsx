import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppointments } from "@/hooks/useAppointments";
import { useAuthStore } from "@/store/authStore";
import { Icon } from "@/components";
import { ROUTES, APPOINTMENT_STATUS } from "@/constants/appConstants";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

// ── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay },
});

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay },
});

// ── Greeting helper ───────────────────────────────────────────────────────────
function getGreeting(t) {
  const h = new Date().getHours();
  if (h < 12) return { text: t("patient.greetings.morning"), emoji: "☀️" };
  if (h < 17) return { text: t("patient.greetings.afternoon"), emoji: "🌤️" };
  return { text: t("patient.greetings.evening"), emoji: "🌙" };
}

// ── Days-until helper ─────────────────────────────────────────────────────────
function getDaysUntil(t, dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  const diff = Math.round((target - today) / 86400000);
  if (diff === 0) return t("patient.days.today");
  if (diff === 1) return t("patient.days.tomorrow");
  if (diff > 0 && diff < 31) return t("patient.days.inDays", { count: diff });
  return null;
}

// ── Vitals data ───────────────────────────────────────────────────────────────
const VITALS = [
  {
    key: "bp",
    labelKey: "patient.vitals.bloodPressure",
    value: "120/80",
    unit: "mmHg",
    icon: "faHeartbeat",
    trendKey: "patient.vitals.stable",
    statusKey: "patient.vitals.normal",
    gradFrom: "#fffdf2",
    gradTo: "#fff3b4",
    ring: "ring-brand-100",
    iconBg: "bg-accent-soft",
    iconColor: "text-brand-600",
    dotColor: "bg-brand-400",
    statusColor: "text-brand-600",
  },
  {
    key: "hr",
    labelKey: "patient.vitals.heartRate",
    value: "72",
    unit: "bpm",
    icon: "faWind",
    trendKey: "patient.vitals.healthy",
    statusKey: "patient.vitals.healthy",
    gradFrom: "#f0fdf4",
    gradTo: "#ecfdf5",
    ring: "ring-emerald-100",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    dotColor: "bg-emerald-400",
    statusColor: "text-emerald-500",
  },
];

// ── Quick Actions ─────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    icon: "faCalendarPlus",
    labelKey: "patient.quickActions.bookNow",
    to: ROUTES.bookAppointment,
    isPrimary: true,
  },
  {
    icon: "faClipboardList",
    labelKey: "patient.quickActions.history",
    to: ROUTES.medicalHistory,
    isPrimary: false,
  },
  {
    icon: "faCalendarDays",
    labelKey: "patient.quickActions.myVisits",
    to: ROUTES.myAppointments,
    isPrimary: false,
  },
  {
    icon: "faCircleUser",
    labelKey: "patient.quickActions.profile",
    to: ROUTES.profile,
    isPrimary: false,
  },
];

// ── Status styling map ────────────────────────────────────────────────────────
const STATUS_MAP = {
  confirmed: {
    labelKey: "patient.status.confirmed",
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  pending: {
    labelKey: "patient.status.pending",
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
  },
  completed: {
    labelKey: "patient.status.completed",
    dot: "bg-slate-300",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
  },
  cancelled: {
    labelKey: "patient.status.cancelled",
    dot: "bg-rose-300",
    badge: "bg-rose-50 text-rose-600 border-rose-100",
  },
};

function formatApptDate(dateStr, locale) {
  if (!dateStr) return { day: "--", month: "---", full: "Date TBD" };
  const d = new Date(`${dateStr}T00:00:00`);
  return {
    day: d.toLocaleString(locale, { day: "2-digit" }),
    month: d.toLocaleString(locale, { month: "short" }),
    full: d.toLocaleDateString(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
  };
}

// ── Shimmer Skeleton ──────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-100 ${className}`}
      style={{ borderRadius: "inherit" }}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
function PatientDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { data: appointmentsData, isLoading } = useAppointments({
    patientId: user.id,
  });
  const greeting = getGreeting(t);
  const firstName = user?.name?.split(" ")[0] || t("common.there", { defaultValue: "there" });
  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";

  const stats = useMemo(() => {
    if (!appointmentsData?.data)
      return { upcoming: [], next: null, totalVisits: 0, allUpcoming: [] };

    const all = appointmentsData.data;
    const completed = all.filter(
      (a) => a.status === APPOINTMENT_STATUS.COMPLETED,
    );
    const upcoming = all
      .filter(
        (a) =>
          a.status === APPOINTMENT_STATUS.PENDING ||
          a.status === APPOINTMENT_STATUS.CONFIRMED,
      )
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`),
      );

    return {
      allUpcoming: upcoming,
      upcoming: upcoming.slice(1, 5),
      next: upcoming[0] || null,
      totalVisits: completed.length,
    };
  }, [appointmentsData]);

  const nextDate = formatApptDate(stats.next?.date, locale);
  const daysUntil = getDaysUntil(t, stats.next?.date);

  const handleQuickAction = (labelKey) => {
    toast(t("common.opening", { defaultValue: "Opening {{label}}...", label: t(labelKey) }));
  };

  return (
    <div className="relative  space-y-5 pb-28">
      {/* ── 1. PERSONALIZED HEADER ────────────────────────────────────────── */}
      <motion.header
        {...fadeUp(0)}
        className="relative overflow-hidden rounded-[28px] p-6"
        style={{
          background:
            "linear-gradient(145deg, #fffdf2 0%, #eef5ff 48%, #fff3b4 100%)",
        }}
      >
        {/* Decorative blobs */}
        <Link
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl"
          style={{ background: "rgba(31,64,114,0.14)" }}
          onClick={() => handleQuickAction(action.label)}
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-10 h-44 w-44 rounded-full blur-3xl"
          style={{ background: "rgba(140,200,170,0.14)" }}
        />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="flex h-[58px] w-[58px] items-center justify-center rounded-full text-xl font-black text-white shadow-md ring-[3px] ring-white"
                style={{
                  background: "linear-gradient(135deg, #1f4072, #4f86cf)",
                }}
              >
                {firstName.charAt(0).toUpperCase()}
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
            </div>

            <div>
              <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <span>{greeting.emoji}</span>
                {greeting.text}
              </p>
              <h1 className="mt-0.5 text-[22px] font-black leading-none tracking-tight text-slate-900">
                {firstName}!
              </h1>
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <p className="text-[10px] font-semibold text-slate-400">
                  {t("patient.header.healthStatus")}
                </p>
              </div>
            </div>
          </div>

          {/* Notification bell */}
          <button className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-white backdrop-blur-sm transition-all hover:bg-white active:scale-95">
            <Icon name="faBell" className="text-[13px] text-slate-500" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
        </div>

        {/* Brand ribbon */}
        <div className="relative mt-4 flex items-center gap-2.5 rounded-xl border border-white/70 bg-white/50 px-3.5 py-2.5 backdrop-blur-sm">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(31,64,114,0.1)" }}
          >
            <Icon
              name="faShieldHalved"
              className="text-[11px] text-brand-600"
            />
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            <span className="font-black text-slate-700">{t("app.brand")}</span> · {t("patient.header.brandTagline")}
          </p>
        </div>
      </motion.header>

      {/* ── 2. QUICK ACTIONS ──────────────────────────────────────────────── */}
      <motion.section {...fadeUp(0.05)}>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.labelKey} to={action.to} className="group">
              <div
                className={`flex flex-col items-center gap-2 rounded-2xl p-3 text-center transition-all active:scale-95 ${
                  action.isPrimary
                    ? "text-white shadow-md"
                    : "border border-slate-100 bg-white hover:border-brand-200 hover:shadow-sm"
                }`}
                style={
                  action.isPrimary
                    ? {
                        background: "linear-gradient(135deg, #1f4072, #4f86cf)",
                        boxShadow: "0 4px 16px rgba(31,64,114,0.3)",
                      }
                    : {}
                }
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    action.isPrimary ? "bg-white/20" : "bg-brand-50"
                  }`}
                >
                  <Icon
                    name={action.icon}
                    className={`text-sm ${
                      action.isPrimary ? "text-white" : "text-brand-500"
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-black leading-tight ${
                    action.isPrimary ? "text-white/90" : "text-slate-500"
                  }`}
                >
                  {t(action.labelKey)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* ── 3. NEXT APPOINTMENT HERO ──────────────────────────────────────── */}
      <motion.section {...scaleIn(0.1)}>
        <div className="mb-3 flex items-center justify-between px-0.5">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            {t("patient.dashboard.nextAppointment")}
          </h2>
          <Link
            to={ROUTES.myAppointments}
            className="text-[10px] font-black uppercase tracking-widest text-brand-600 hover:underline"
          >
            {t("patient.dashboard.seeAll")} →
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="hero-sk"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-64 rounded-[28px]"
            >
              <Skeleton className="h-full rounded-[28px]" />
            </motion.div>
          ) : stats.next ? (
            /* ── Has appointment ── */
            <motion.div
              key="hero-appt"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-[28px] p-6 text-white"
              style={{
                background:
                  "linear-gradient(145deg, #1f4072 0%, #122746 65%, #081426 100%)",
              }}
            >
              {/* Glow orbs */}
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl"
                style={{ background: "rgba(255,243,180,0.2)" }}
              />
              <div
                className="pointer-events-none absolute -bottom-12 left-8 h-48 w-48 rounded-full blur-3xl"
                style={{ background: "rgba(80,140,110,0.12)" }}
              />

              {/* Top status row */}
              <div className="relative mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                    {t("patient.header.comingUp")}
                  </span>
                </div>
                {daysUntil && (
                  <div
                    className="rounded-full px-3 py-1 text-[10px] font-black text-white/70"
                    style={{
                      background: "rgba(255,255,255,0.09)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {daysUntil}
                  </div>
                )}
              </div>

              {/* Date + time */}
              <div className="relative">
                <h3 className="text-[28px] font-black leading-[1.1] tracking-tight">
                  {nextDate.full}
                </h3>
                <div className="mt-1.5 flex items-center gap-2">
                  <Icon name="faClock" className="text-[10px] text-brand-400" />
                  <p className="text-[15px] font-bold text-brand-300">
                    {t("patient.header.at")} {stats.next.time}
                  </p>
                </div>
              </div>

              {/* Doctor info card */}
              <div
                className="relative mt-5 rounded-2xl p-3.5"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                    style={{
                      background: "linear-gradient(135deg,#1f4072,#4f86cf)",
                    }}
                  >
                    {stats.next.doctorName?.charAt(0) || "D"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-black text-white">
                      Dr. {stats.next.doctorName}
                    </p>
                    <p className="text-[11px] text-white/40">
                      {stats.next.specialty || t("patient.header.generalPractitioner", { defaultValue: "General Practitioner" })}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-xl px-2.5 py-1 text-[10px] font-black text-brand-300"
                    style={{
                      background: "rgba(255,243,180,0.16)",
                      border: "1px solid rgba(255,243,180,0.24)",
                    }}
                  >
                    {stats.next.serviceName || t("patient.header.consultation", { defaultValue: "Consultation" })}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="relative mt-4 flex gap-2.5">
                <Link to={ROUTES.myAppointments} className="flex-1">
                  <button
                    className="w-full rounded-2xl py-3 text-[11px] font-black uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #1f4072, #4f86cf)",
                    }}
                  >
                    {t("patient.header.manageBooking")}
                  </button>
                </Link>
                <button
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white transition-all hover:bg-white/15 active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  title={t("patient.header.getDirections")}
                >
                  <Icon name="faLocationDot" className="text-sm" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* ── Empty state ── */
            <motion.div
              key="hero-empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-brand-100 bg-gradient-to-br from-brand-50/60 to-surface-100 px-8 py-14 text-center"
            >
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  background: "linear-gradient(135deg, #fffdf2, #fff3b4)",
                }}
              >
                <Icon
                  name="faCalendarPlus"
                  className="text-2xl text-brand-400"
                />
              </div>
              <h3 className="text-[17px] font-black text-slate-800">
                {t("patient.dashboard.noUpcomingTitle")}
              </h3>
              <p className="mt-1.5 max-w-[240px] text-[13px] leading-relaxed text-slate-400">
                {t("patient.dashboard.noUpcomingSubtitle")}
              </p>
              <Link to={ROUTES.bookAppointment} className="mt-6">
                <button
                  className="rounded-2xl px-7 py-3.5 text-[13px] font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #1f4072, #4f86cf)",
                    boxShadow: "0 6px 24px rgba(31,64,114,0.35)",
                  }}
                >
                  {t("patient.dashboard.bookFirst")}
                </button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* ── 4. HEALTH VITALS SNAPSHOT ─────────────────────────────────────── */}
      <motion.section {...fadeUp(0.15)}>
        <h2 className="mb-3 px-0.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          {t("patient.dashboard.healthSnapshot")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {VITALS.map((v) => (
            <div
              key={v.key}
              className={`relative overflow-hidden rounded-2xl p-4 ring-1 ${v.ring}`}
              style={{
                background: `linear-gradient(145deg, ${v.gradFrom}, ${v.gradTo})`,
              }}
            >
              {/* Decoration circle */}
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl"
                style={{ background: "rgba(255,255,255,0.7)" }}
              />

              <div className="relative flex items-start justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ${v.ring}`}
                >
                  <Icon name={v.icon} className={`text-sm ${v.iconColor}`} />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${v.dotColor}`} />
                  <span className={`text-[9px] font-black ${v.statusColor}`}>
                    {t(v.statusKey)}
                  </span>
                </div>
              </div>

              <div className="relative mt-3">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                  {t(v.labelKey)}
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-[22px] font-black leading-none text-slate-900">
                    {v.value}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">
                    {v.unit}
                  </span>
                </div>
                <p className="mt-1 text-[9px] font-semibold text-slate-400">
                  {t(v.trendKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── 5. QUICK HEALTH STATS ─────────────────────────────────────────── */}
      <motion.section {...fadeUp(0.19)}>
        <h2 className="mb-3 px-0.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          {t("patient.dashboard.healthOverview")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Total Visits */}
          <Link to={ROUTES.medicalHistory} className="group">
            <div className="flex flex-col justify-between rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-rose-50/30 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-brand-100">
                <Icon
                  name="faClipboardList"
                  className="text-sm text-brand-500"
                />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {t("patient.dashboard.totalVisits")}
                </p>
                <div className="mt-1 text-[28px] font-black leading-none text-slate-900">
                  {isLoading ? (
                    <span className="inline-block h-7 w-10 animate-pulse rounded-lg bg-brand-100" />
                  ) : (
                    stats.totalVisits
                  )}
                </div>
                <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-brand-500 group-hover:underline">
                  {t("patient.dashboard.viewRecords")} →
                </p>
              </div>
            </div>
          </Link>

          {/* Active Medications */}
          <div className="flex flex-col justify-between rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50/30 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-emerald-100">
              <Icon name="faPills" className="text-sm text-emerald-500" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                {t("patient.dashboard.activeMedications")}
              </p>
              <div className="mt-1 text-[28px] font-black leading-none text-slate-900">
                03
              </div>
              <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                {t("patient.dashboard.activePlan")}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 6. UPCOMING APPOINTMENTS LIST ─────────────────────────────────── */}
      <motion.section {...fadeUp(0.22)}>
        <div className="mb-3 flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              {t("patient.dashboard.upcomingVisits")}
            </h2>
            {!isLoading && stats.upcoming.length > 0 && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[9px] font-black text-brand-600">
                {stats.upcoming.length}
              </span>
            )}
          </div>
          {stats.upcoming.length > 0 && (
            <Link
              to={ROUTES.myAppointments}
              className="text-[10px] font-black uppercase tracking-widest text-brand-600 hover:underline"
            >
              {t("patient.dashboard.all")} →
            </Link>
          )}
        </div>

        <div className="space-y-2.5">
          {isLoading ? (
            [1, 2].map((i) => (
              <div key={i} className="h-[76px] rounded-2xl">
                <Skeleton className="h-full rounded-2xl" />
              </div>
            ))
          ) : stats.upcoming.length > 0 ? (
            stats.upcoming.map((appt, i) => {
              const d = formatApptDate(appt.date, locale);
              const s = STATUS_MAP[appt.status] || STATUS_MAP.pending;
              return (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.06,
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md"
                >
                  {/* Date block */}
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 leading-none">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      {d.month}
                    </span>
                    <span className="text-[18px] font-black text-slate-900">
                      {d.day}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-slate-900">
                      {appt.serviceName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                      <Icon name="faUserMd" className="text-[9px]" />
                      Dr. {appt.doctorName}
                      <span className="text-slate-300">·</span>
                      {appt.time}
                    </p>
                  </div>

                  {/* Status + arrow */}
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${s.badge}`}
                    >
                      {t(s.labelKey)}
                    </span>
                    <Icon
                      name="faChevronRight"
                      className="text-[9px] text-slate-300 transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                </motion.div>
              );
            })
          ) : (
            /* Empty appointments list */
            <div className="flex flex-col items-center py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                <Icon name="faCalendar" className="text-xl text-slate-200" />
              </div>
              <p className="text-[13px] font-semibold text-slate-400">
                {t("patient.dashboard.noOtherUpcoming")}
              </p>
            </div>
          )}
        </div>
      </motion.section>

      {/* ── 7. SUPPORT HUB ────────────────────────────────────────────────── */}
      <motion.section {...fadeUp(0.26)}>
        <div
          className="relative overflow-hidden rounded-[24px] p-5"
          style={{
            background: "linear-gradient(145deg, #1f4072 0%, #122746 100%)",
          }}
        >
          {/* Glow */}
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl"
            style={{ background: "rgba(255,243,180,0.22)" }}
          />

          <div className="relative flex items-center gap-3.5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Icon name="faHeadset" className="text-base text-brand-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-black text-white">
                {t("patient.dashboard.supportTitle")}
              </p>
              <p className="text-[11px] text-white/40">
                {t("patient.dashboard.supportSubtitle")}
              </p>
            </div>
            <button
              className="ml-auto shrink-0 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #4f86cf, #1f4072)",
              }}
            >
              {t("patient.dashboard.callNow")}
            </button>
          </div>

          {/* Chat entry point */}
          <div
            className="relative mt-4 border-t pt-4"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <button className="flex w-full items-center justify-between">
              <span className="flex items-center gap-2 text-[11px] text-white/40">
                <Icon name="faCommentDots" className="text-brand-400" />
                {t("patient.dashboard.startSupportChat")}
              </span>
              <Icon
                name="faChevronRight"
                className="text-[9px] text-white/20"
              />
            </button>
          </div>
        </div>
      </motion.section>

      {/* ── FLOATING ACTION BUTTON ─────────────────────────────────────────── */}
      <Link
        to={ROUTES.bookAppointment}
        className="fixed bottom-8 right-6 z-50 lg:right-10"
      >
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.5,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-14 w-14 items-center justify-center rounded-full text-white"
          style={{
            background: "linear-gradient(135deg, #1f4072, #4f86cf)",
            boxShadow: "0 8px 32px rgba(31,64,114,0.45)",
          }}
          title={t("patient.dashboard.bookFab")}
        >
          <Icon name="faPlus" className="text-lg" />
        </motion.button>
      </Link>
    </div>
  );
}

export default PatientDashboard;
