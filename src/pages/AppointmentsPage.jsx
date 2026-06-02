import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  useAppointments,
  useCancelAppointment,
  useUpdateAppointmentStatus,
  useUpdateAppointment,
  useCreateAppointment,
} from "@/hooks/useAppointments";
import { useUsers } from "@/hooks/useUsers";
import { usePatients, useCreatePatient } from "@/hooks/usePatients";
import { servicesApi } from "@/api/mockApi";
import { useAuthStore } from "@/store/authStore";
import { Table, Button, Badge, Card, Icon, Modal, Input } from "@/components";
import {
  ROLES,
  STATUS_COLORS,
  APPOINTMENT_STATUS,
  ROUTES,
} from "@/constants/appConstants";
import { motion, AnimatePresence } from "framer-motion";
import { classNames } from "@/utils";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
function AppointmentsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [view, setView] = useState("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [activeDay, setActiveDay] = useState(null);
  const [bookingDate, setBookingDate] = useState(null);

  // Modals state
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const queryParams = {
    search: searchTerm,
    status: statusFilter === "all" ? "" : statusFilter,
    doctorId:
      doctorFilter === "all"
        ? user.role === ROLES.DOCTOR
          ? user.id
          : ""
        : doctorFilter,
    ...(user.role === ROLES.PATIENT
      ? {
          patientId: user.id,
        }
      : {}),
  };
  const { data: appointmentsData, isLoading } = useAppointments(queryParams);
  const { data: doctorsData } = useUsers({
    role: ROLES.DOCTOR,
  });
  const { data: patientsData } = usePatients();
  const { data: servicesData } = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesApi.list(),
  });
  const { mutate: cancelAppt } = useCancelAppointment();
  const { mutate: updateStatus } = useUpdateAppointmentStatus();
  const { mutate: updateAppt } = useUpdateAppointment();
  const { mutate: createAppt } = useCreateAppointment();
  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(monthCursor);
  const monthShortFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
      }),
    [locale],
  );
  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: "short",
    });
    const base = new Date(2024, 0, 7);
    return Array.from(
      {
        length: 7,
      },
      (_, idx) =>
        formatter.format(
          new Date(base.getFullYear(), base.getMonth(), base.getDate() + idx),
        ),
    );
  }, [locale]);
  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const todayKey = getDateKey(new Date());
  const monthAppointments = useMemo(() => {
    if (!appointmentsData?.data) return [];
    return appointmentsData.data.filter((appt) => {
      if (!appt.date) return false;
      const apptDate = new Date(`${appt.date}T00:00:00`);
      return (
        apptDate.getFullYear() === monthCursor.getFullYear() &&
        apptDate.getMonth() === monthCursor.getMonth()
      );
    });
  }, [appointmentsData, monthCursor]);
  const appointmentsByDate = useMemo(() => {
    const map = {};
    monthAppointments.forEach((appt) => {
      if (!appt.date) return;
      if (!map[appt.date]) map[appt.date] = [];
      map[appt.date].push(appt);
    });
    return map;
  }, [monthAppointments]);
  const stats = useMemo(() => {
    if (!monthAppointments.length)
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
      };
    return {
      total: monthAppointments.length,
      pending: monthAppointments.filter((a) => a.status === "pending").length,
      confirmed: monthAppointments.filter((a) => a.status === "confirmed")
        .length,
    };
  }, [monthAppointments]);
  const statusLabelMap = useMemo(
    () => ({
      pending: t("pages.appointmentspage.pending"),
      confirmed: t("pages.appointmentspage.confirmed"),
      completed: t("pages.appointmentspage.completed"),
      cancelled: t("pages.appointmentspage.cancelled"),
    }),
    [t, i18n.language],
  );
  const getStatusLabel = (status) => statusLabelMap[status] || status;
  const daysGrid = useMemo(() => {
    const start = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth(),
      1,
    );
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - start.getDay());
    return Array.from(
      {
        length: 42,
      },
      (_, idx) => {
        const day = new Date(gridStart);
        day.setDate(gridStart.getDate() + idx);
        return day;
      },
    );
  }, [monthCursor]);
  const handleEditOpen = (appt) => {
    setEditingAppointment(appt);
    reset({
      date: appt.date,
      time: appt.time,
      notes: appt.notes || "",
    });
  };
  const openBookingForDate = (dateKey) => {
    setBookingDate(dateKey);
    setActiveDay(null);
    setIsBookingOpen(true);
    reset({
      date: dateKey,
    });
  };
  const [bookingStep, setBookingStep] = useState(1);
  const [isQuickAddingPatient, setIsQuickAddingPatient] = useState(false);
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  const { mutate: createPatient } = useCreatePatient();
  const selectedPatientId = watch("patientId");
  const selectedDoctorId = watch("doctorId");
  const selectedServiceId = watch("serviceId");
  const selectedDate = watch("date");
  const selectedTime = watch("time");
  const selectedPatient = useMemo(
    () => patientsData?.data.find((p) => p.id === selectedPatientId),
    [patientsData, selectedPatientId],
  );
  const selectedDoctor = useMemo(
    () => doctorsData?.data.find((d) => d.id === selectedDoctorId),
    [doctorsData, selectedDoctorId],
  );
  const selectedService = useMemo(
    () => servicesData?.data.find((s) => s.id === selectedServiceId),
    [servicesData, selectedServiceId],
  );
  const onBookingSubmit = (data) => {
    const payload = {
      ...data,
      date: data.date || bookingDate,
      patientName: selectedPatient?.name,
      doctorName: selectedDoctor?.name,
      serviceName: selectedService?.name,
      price: selectedService?.price || 0,
      status: APPOINTMENT_STATUS.PENDING,
    };
    createAppt(payload, {
      onSuccess: () => {
        setIsBookingOpen(false);
        setBookingStep(1);
        reset();
      },
    });
  };
  const onEditSubmit = (data) => {
    updateAppt(
      {
        id: editingAppointment.id,
        data,
      },
      {
        onSuccess: () => setEditingAppointment(null),
      },
    );
  };
  const statusStyles = {
    confirmed: "border-emerald-400/80 bg-emerald-50/70 text-emerald-700",
    pending: "border-amber-400/80 bg-amber-50/70 text-amber-700",
    cancelled: "border-rose-200 bg-rose-50/30 text-rose-400",
    completed: "border-slate-300 bg-slate-50 text-slate-600",
  };
  const handleDrop = (dateKey, event) => {
    event.preventDefault();
    const apptId = event.dataTransfer.getData("text/plain");
    if (!apptId) return;
    updateAppt({
      id: apptId,
      data: {
        date: dateKey,
      },
    });
  };
  const handleStartSession = (appt) => {
    updateStatus({
      id: appt.id,
      status: APPOINTMENT_STATUS.CONFIRMED,
    });
    navigate(`${ROUTES.doctorSession}/${appt.id}`);
  };
  const columns = [
    {
      header: t("pages.appointmentspage.patient"),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs border border-brand-100">
            {row.patientName?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-none">
              {row.patientName}
            </p>
            <p className="mt-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {t("pages.appointmentspage.id")}
              {row.patientId}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: t("pages.appointmentspage.schedule"),
      render: (row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Icon name="faCalendarAlt" className="text-brand-500 text-[10px]" />
            {row.date}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-1">
            <Icon name="faClock" className="text-slate-300 text-[10px]" />
            {row.time}
          </div>
        </div>
      ),
    },
    {
      header: t("pages.appointmentspage.status"),
      render: (row) => (
        <Badge
          tone={STATUS_COLORS[row.status] || "secondary"}
          className="uppercase font-black text-[10px] tracking-widest"
        >
          {getStatusLabel(row.status)}
        </Badge>
      ),
    },
    {
      header: t("pages.appointmentspage.actions"),
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          {user.role === ROLES.DOCTOR ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartSession(row)}
                disabled={
                  row.status === APPOINTMENT_STATUS.CONFIRMED ||
                  row.status === APPOINTMENT_STATUS.COMPLETED
                }
                className="h-9"
              >
                <Icon name="faPlay" className="mr-2" />
                {t("pages.appointmentspage.startSession")}
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() =>
                  updateStatus({
                    id: row.id,
                    status: APPOINTMENT_STATUS.COMPLETED,
                  })
                }
                disabled={row.status === APPOINTMENT_STATUS.COMPLETED}
                className="h-9"
              >
                <Icon name="faCheck" className="mr-2" />
                {t("pages.appointmentspage.completed")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (
                    confirm(t("pages.appointmentspage.cancelThisAppointment"))
                  )
                    cancelAppt(row.id);
                }}
                className="h-9 text-rose-500 hover:bg-rose-50"
              >
                <Icon name="faXmark" className="mr-2" />
                {t("pages.appointmentspage.cancel")}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditOpen(row)}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <Icon name="faPen" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm(t("pages.appointmentspage.cancel2")))
                    cancelAppt(row.id);
                }}
                className="h-8 w-8 p-0 rounded-lg hover:text-rose-500"
              >
                <Icon name="faTimes" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];
  const handleQuickAddPatient = (event) => {
    event.preventDefault();
    const name = watch("newPatientName");
    const phone = watch("newPatientPhone");
    if (!name || !phone) return;
    createPatient(
      {
        name,
        phone,
      },
      {
        onSuccess: (newP) => {
          setValue("patientId", newP.id);
          setIsQuickAddingPatient(false);
        },
      },
    );
  };
  const handleBookingClose = () => {
    setIsBookingOpen(false);
    setBookingStep(1);
    reset();
  };

  // ── Patient card view ────────────────────────────────────────────────────
  const PATIENT_STATUS_TABS = [
    {
      key: "all",
      label: t("pages.appointmentspage.all"),
    },
    {
      key: "confirmed",
      label: t("pages.appointmentspage.confirmed"),
    },
    {
      key: "pending",
      label: t("pages.appointmentspage.pending"),
    },
    {
      key: "completed",
      label: t("pages.appointmentspage.completed2"),
    },
    {
      key: "cancelled",
      label: t("pages.appointmentspage.cancelled"),
    },
  ];
  const PATIENT_BADGE = {
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    completed: "bg-slate-50 text-slate-600 border-slate-200",
    cancelled: "bg-rose-50 text-rose-600 border-rose-100",
  };
  const PATIENT_DOT = {
    confirmed: "bg-emerald-400",
    pending: "bg-amber-400",
    completed: "bg-slate-300",
    cancelled: "bg-rose-300",
  };
  function fmtDay(dateStr) {
    if (!dateStr)
      return {
        day: "--",
        month: "---",
      };
    const d = new Date(`${dateStr}T00:00:00`);
    return {
      day: String(d.getDate()).padStart(2, "0"),
      month: monthShortFormatter.format(d),
    };
  }
  if (user.role === ROLES.PATIENT) {
    const allAppts = appointmentsData?.data || [];
    return (
      <div className=" space-y-5 pb-24">
        {/* ── Patient Header ── */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              {t("pages.appointmentspage.mySchedule")}
            </p>
            <h1 className="mt-0.5 text-2xl font-black tracking-tight text-slate-900">
              {t("pages.appointmentspage.myAppointments")}
            </h1>
          </div>
          <Link to={ROUTES.bookAppointment}>
            <Button className="h-11 gap-2 rounded-2xl px-5 shadow-md shadow-brand-500/20">
              <Icon name="faPlus" />
              {t("pages.appointmentspage.bookNow")}
            </Button>
          </Link>
        </header>

        {/* ── Summary chips ── */}
        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              {t("pages.appointmentspage.total")}
            </p>
            <p className="mt-0.5 text-xl font-black text-slate-900">
              {isLoading ? "—" : allAppts.length}
            </p>
          </div>
          <div className="flex-1 rounded-2xl border border-amber-100 bg-amber-50/60 p-3 text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-500">
              {t("pages.appointmentspage.pending2")}
            </p>
            <p className="mt-0.5 text-xl font-black text-slate-900">
              {isLoading
                ? "—"
                : allAppts.filter((a) => a.status === "pending").length}
            </p>
          </div>
          <div className="flex-1 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
              {t("pages.appointmentspage.confirmed2")}
            </p>
            <p className="mt-0.5 text-xl font-black text-slate-900">
              {isLoading
                ? "—"
                : allAppts.filter((a) => a.status === "confirmed").length}
            </p>
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {PATIENT_STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={classNames(
                "shrink-0 rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-all",
                statusFilter === tab.key
                  ? "bg-slate-900 text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Appointments Cards ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={statusFilter}
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{
              duration: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="space-y-3"
          >
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[88px] animate-pulse rounded-2xl bg-slate-100"
                />
              ))
            ) : allAppts.length === 0 /* Empty state */ ? (
              <div className="flex flex-col items-center rounded-[28px] border-2 border-dashed border-brand-100 bg-gradient-to-br from-brand-50/50 to-surface-100 py-16 text-center">
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(135deg,#fffdf2,#fff3b4)",
                  }}
                >
                  <Icon
                    name="faCalendarPlus"
                    className="text-2xl text-brand-400"
                  />
                </div>
                <h3 className="text-[17px] font-black text-slate-800">
                  {t("pages.appointmentspage.noAppointmentsFound")}
                </h3>
                <p className="mt-1.5 max-w-[220px] text-[13px] leading-relaxed text-slate-400">
                  {statusFilter === "all"
                    ? t("pages.appointmentspage.noAppointmentsYet")
                    : t("pages.appointmentspage.noAppointmentsByStatus", {
                        status: statusLabelMap[statusFilter] || statusFilter,
                      })}
                </p>
                {statusFilter === "all" && (
                  <Link to={ROUTES.bookAppointment} className="mt-6">
                    <button
                      className="rounded-2xl px-7 py-3.5 text-[13px] font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                      style={{
                        background: "linear-gradient(135deg,#1f4072,#4f86cf)",
                        boxShadow: "0 6px 24px rgba(31,64,114,0.35)",
                      }}
                    >
                      {t("pages.appointmentspage.bookYourFirstAppointment")}
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              allAppts.map((appt, i) => {
                const d = fmtDay(appt.date);
                const badgeCls =
                  PATIENT_BADGE[appt.status] || PATIENT_BADGE.pending;
                const dotCls = PATIENT_DOT[appt.status] || PATIENT_DOT.pending;
                const statusLabel = appt.status
                  ? getStatusLabel(appt.status)
                  : t("pages.appointmentspage.pending");
                return (
                  <motion.div
                    key={appt.id}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: i * 0.05,
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="group relative flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md"
                  >
                    {/* Date block */}
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 leading-none">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        {d.month}
                      </span>
                      <span className="text-[20px] font-black text-slate-900">
                        {d.day}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-slate-900">
                        {appt.serviceName ||
                          t("pages.appointmentspage.consultation")}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                        <Icon name="faUserMd" className="text-[9px]" />
                        {t("pages.appointmentspage.doctorPrefix", {
                          name: appt.doctorName,
                        })}
                        <span className="text-slate-200">·</span>
                        <Icon name="faClock" className="text-[9px]" />
                        {appt.time}
                      </p>
                    </div>

                    {/* Status + actions */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />
                        <span
                          className={`rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${badgeCls}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {appt.status !== "completed" &&
                          appt.status !== "cancelled" && (
                            <button
                              onClick={() => handleEditOpen(appt)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
                              title={t("pages.appointmentspage.edit")}
                            >
                              <Icon name="faPen" className="text-[9px]" />
                            </button>
                          )}
                        {appt.status !== "cancelled" &&
                          appt.status !== "completed" && (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    t(
                                      "pages.appointmentspage.cancelThisAppointment2",
                                    ),
                                  )
                                )
                                  cancelAppt(appt.id);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
                              title={t("pages.appointmentspage.cancel3")}
                            >
                              <Icon name="faTimes" className="text-[9px]" />
                            </button>
                          )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>

        {/* Edit modal for patients */}
        <Modal
          isOpen={!!editingAppointment}
          onClose={() => setEditingAppointment(null)}
          title={t("pages.appointmentspage.modifyAppointment")}
          size="md"
        >
          {editingAppointment && (
            <form
              onSubmit={handleSubmit(onEditSubmit)}
              className="space-y-6 pt-4"
            >
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label={t("pages.appointmentspage.revisedDate")}
                  type="date"
                  {...register("date", {
                    required: t("pages.appointmentspage.dateIsRequired"),
                  })}
                />
                <Input
                  label={t("pages.appointmentspage.revisedTime")}
                  type="time"
                  {...register("time", {
                    required: t("pages.appointmentspage.timeIsRequired"),
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="ml-1 text-sm font-bold text-slate-700">
                  {t("pages.appointmentspage.notes")}
                </label>
                <textarea
                  className="h-28 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-brand-500"
                  {...register("notes")}
                />
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-50 pt-6">
                <Button
                  variant="ghost"
                  onClick={() => setEditingAppointment(null)}
                >
                  {t("pages.appointmentspage.cancel4")}
                </Button>
                <Button type="submit">
                  {t("pages.appointmentspage.saveChanges")}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    );
  }
  return (
    <div className="space-y-8 pb-12">
      {/* Premium Header with Mini Analytics */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-brand-500 animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              {t("pages.appointmentspage.clinicalHub")}
              {monthLabel}
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-950 uppercase">
            {user.role === ROLES.DOCTOR
              ? t("pages.appointmentspage.myAppointments")
              : t("pages.appointmentspage.scheduling")}
          </h1>
        </div>

        <div className="flex items-center gap-6 bg-white/50 backdrop-blur-xl p-6 rounded-[32px] border border-white shadow-glass">
          <div className="text-center px-4 border-r border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {t("pages.appointmentspage.total2")}
            </p>
            <p className="text-xl font-black text-slate-900">{stats.total}</p>
          </div>
          <div className="text-center px-4 border-r border-slate-100">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">
              {t("pages.appointmentspage.pending3")}
            </p>
            <p className="text-xl font-black text-slate-900">{stats.pending}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
              {t("pages.appointmentspage.confirmed3")}
            </p>
            <p className="text-xl font-black text-slate-900">
              {stats.confirmed}
            </p>
          </div>
          <Button
            onClick={() => setIsBookingOpen(true)}
            className="h-14 px-8 rounded-2xl shadow-xl shadow-brand-500/30 gap-3 ml-4"
          >
            <Icon name="faPlus" />
            {t("pages.appointmentspage.newBooking")}
          </Button>
        </div>
      </header>

      {/* Filters + Navigation */}
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md py-4 -mx-4 px-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200/50">
        <div className="flex items-center gap-2 rounded-2xl bg-white p-1 border border-slate-200 shadow-sm">
          {[
            {
              key: "month",
              label: t("pages.appointmentspage.viewMonth"),
            },
            {
              key: "list",
              label: t("pages.appointmentspage.viewList"),
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={classNames(
                "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                view === tab.key
                  ? "bg-slate-950 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user.role !== ROLES.PATIENT && (
            <div className="relative">
              <Icon
                name="faSearch"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
              />
              <input
                type="text"
                placeholder={t("pages.appointmentspage.searchPatient")}
                className="h-11 w-52 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-bold outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          {user.role !== ROLES.DOCTOR && user.role !== ROLES.PATIENT && (
            <select
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold outline-none focus:ring-4 focus:ring-brand-500/10"
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
            >
              <option value="all">
                {t("pages.appointmentspage.allDoctors")}
              </option>
              {doctorsData?.data.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          )}
          <select
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold outline-none focus:ring-4 focus:ring-brand-500/10"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t("pages.appointmentspage.allStatus")}</option>
            <option value="pending">
              {t("pages.appointmentspage.pending4")}
            </option>
            <option value="confirmed">
              {t("pages.appointmentspage.confirmed4")}
            </option>
            <option value="completed">
              {t("pages.appointmentspage.completed3")}
            </option>
            <option value="cancelled">
              {t("pages.appointmentspage.cancelled2")}
            </option>
          </select>
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMonthCursor(new Date())}
            >
              {t("pages.appointmentspage.today")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setMonthCursor(
                  new Date(
                    monthCursor.getFullYear(),
                    monthCursor.getMonth() - 1,
                    1,
                  ),
                )
              }
              className="h-10 w-10 p-0"
            >
              <Icon name="faChevronLeft" />
            </Button>
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 min-w-[140px] text-center">
              {monthLabel}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setMonthCursor(
                  new Date(
                    monthCursor.getFullYear(),
                    monthCursor.getMonth() + 1,
                    1,
                  ),
                )
              }
              className="h-10 w-10 p-0"
            >
              <Icon name="faChevronRight" />
            </Button>
          </div>
        </div>
      </div>

      {/* Views */}
      <div className="min-h-[640px]">
        <AnimatePresence mode="wait">
          {view === "list" && (
            <motion.div
              key="list"
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: 20,
              }}
            >
              <Card className="p-0 overflow-hidden" variant="premium">
                <Table
                  columns={columns}
                  data={appointmentsData?.data}
                  isLoading={isLoading}
                />
              </Card>
            </motion.div>
          )}

          {view === "month" && (
            <motion.div
              key="month"
              initial={{
                opacity: 0,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.98,
              }}
            >
              <Card className="p-0" variant="premium">
                <div className="grid grid-cols-7 border-b border-slate-100 bg-white/70 px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  {weekdayLabels.map((day) => (
                    <div key={day} className="text-center">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px bg-slate-100">
                  {daysGrid.map((day) => {
                    const dateKey = getDateKey(day);
                    const isToday = dateKey === todayKey;
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isCurrentMonth =
                      day.getMonth() === monthCursor.getMonth();
                    const dayAppointments = appointmentsByDate[dateKey] || [];
                    const visibleAppointments = dayAppointments.slice(0, 3);
                    const overflowCount =
                      dayAppointments.length - visibleAppointments.length;
                    return (
                      <div
                        key={dateKey}
                        onClick={() => openBookingForDate(dateKey)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleDrop(dateKey, event)}
                        className={classNames(
                          "group relative min-h-[150px] bg-white p-3 transition-all",
                          isWeekend ? "bg-slate-50/80" : "bg-white",
                          isCurrentMonth ? "" : "opacity-60",
                          isToday ? "ring-2 ring-brand-500/40 shadow-halo" : "",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={classNames(
                              "text-[11px] font-black",
                              isToday ? "text-brand-600" : "text-slate-500",
                            )}
                          >
                            {day.getDate()}
                          </span>
                          {isToday && (
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-500">
                              {t("pages.appointmentspage.today2")}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 space-y-2">
                          {visibleAppointments.map((appt) => (
                            <button
                              key={appt.id}
                              draggable
                              onDragStart={(event) =>
                                event.dataTransfer.setData(
                                  "text/plain",
                                  appt.id,
                                )
                              }
                              onClick={(event) => {
                                event.stopPropagation();
                                handleEditOpen(appt);
                              }}
                              className={classNames(
                                "group/mini relative w-full rounded-xl border-l-4 px-2.5 py-2 text-left text-[11px] font-bold transition-all hover:shadow-sm",
                                statusStyles[appt.status] ||
                                  "border-brand-500/60 bg-brand-50/60 text-brand-700",
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className="rounded-md bg-white/70 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                  {appt.time}
                                </span>
                                <span className="truncate">
                                  {appt.patientName}
                                </span>
                              </div>
                              <div className="pointer-events-none absolute left-2 top-full z-20 mt-2 w-48 rounded-xl border border-slate-100 bg-white p-3 text-[10px] font-semibold text-slate-500 opacity-0 shadow-lg transition-all group-hover/mini:opacity-100">
                                <p className="text-slate-900 font-bold">
                                  {appt.patientName}
                                </p>
                                <p className="mt-1">{appt.serviceName}</p>
                                <p>{appt.doctorName}</p>
                                <p className="mt-1 uppercase tracking-widest text-[9px]">
                                  {getStatusLabel(appt.status)}
                                </p>
                              </div>
                            </button>
                          ))}

                          {overflowCount > 0 && (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                setActiveDay(dateKey);
                              }}
                              className="text-[10px] font-black uppercase tracking-widest text-brand-500"
                            >
                              +{overflowCount}
                              {t("pages.appointmentspage.more")}
                            </button>
                          )}
                        </div>

                        {dayAppointments.length === 0 && (
                          <div className="absolute bottom-3 left-3 text-[9px] font-black uppercase tracking-[0.3em] text-slate-200 opacity-0 transition-all group-hover:opacity-100">
                            {t("pages.appointmentspage.addAppointment")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Appointment Edit */}
      <Modal
        isOpen={!!editingAppointment}
        onClose={() => setEditingAppointment(null)}
        title={t("pages.appointmentspage.modifyAppointment2")}
        size="md"
      >
        {editingAppointment && (
          <form
            onSubmit={handleSubmit(onEditSubmit)}
            className="space-y-6 pt-4"
          >
            <div className="grid grid-cols-2 gap-6">
              <Input
                label={t("pages.appointmentspage.revisedDate")}
                type="date"
                {...register("date", {
                  required: t("pages.appointmentspage.dateIsRequired2"),
                })}
              />
              <Input
                label={t("pages.appointmentspage.revisedTime")}
                type="time"
                {...register("time", {
                  required: t("pages.appointmentspage.timeIsRequired2"),
                })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                {t("pages.appointmentspage.clinicalNotes")}
              </label>
              <textarea
                className="w-full h-32 rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-500 transition-all"
                {...register("notes")}
              />
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
              <Button
                variant="ghost"
                onClick={() => setEditingAppointment(null)}
              >
                {t("pages.appointmentspage.cancel5")}
              </Button>
              <Button type="submit">
                {t("pages.appointmentspage.saveChanges2")}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={!!activeDay}
        onClose={() => setActiveDay(null)}
        title={t("pages.appointmentspage.dayDetails")}
        size="lg"
      >
        {activeDay && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  {t("pages.appointmentspage.appointments")}
                </p>
                <p className="text-lg font-bold text-slate-900">{activeDay}</p>
              </div>
              <Button
                onClick={() => openBookingForDate(activeDay)}
                className="gap-2"
              >
                <Icon name="faPlus" />
                {t("pages.appointmentspage.addAppointment2")}
              </Button>
            </div>
            <div className="space-y-3">
              {(appointmentsByDate[activeDay] || []).map((appt) => (
                <div
                  key={appt.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleEditOpen(appt)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleEditOpen(appt);
                  }}
                  className={classNames(
                    "w-full cursor-pointer rounded-2xl border-l-4 bg-white px-4 py-3 text-left text-sm font-bold shadow-sm",
                    statusStyles[appt.status] ||
                      "border-brand-500/60 bg-brand-50/60 text-brand-700",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-slate-900">{appt.patientName}</p>
                      <p className="text-xs font-medium text-slate-500">
                        {appt.serviceName} • {appt.doctorName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                        {appt.time}
                      </span>
                      {user.role === ROLES.DOCTOR && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleStartSession(appt);
                            }}
                            disabled={
                              appt.status === APPOINTMENT_STATUS.CONFIRMED ||
                              appt.status === APPOINTMENT_STATUS.COMPLETED
                            }
                          >
                            <Icon name="faPlay" />
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              updateStatus({
                                id: appt.id,
                                status: APPOINTMENT_STATUS.COMPLETED,
                              });
                            }}
                            disabled={
                              appt.status === APPOINTMENT_STATUS.COMPLETED
                            }
                          >
                            <Icon name="faCheck" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (
                                confirm(
                                  t(
                                    "pages.appointmentspage.cancelThisAppointment3",
                                  ),
                                )
                              )
                                cancelAppt(appt.id);
                            }}
                            className="text-rose-500 hover:bg-rose-50"
                          >
                            <Icon name="faXmark" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* MULTI-STEP BOOKING MODAL */}
      <Modal
        isOpen={isBookingOpen}
        onClose={handleBookingClose}
        title={t("pages.appointmentspage.smartAppointmentBooking")}
        size="lg"
      >
        <div className="pt-4">
          {/* Step Indicator */}
          <div className="mb-8 flex items-center justify-center gap-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={classNames(
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                    bookingStep === s
                      ? "bg-brand-500 text-white shadow-halo scale-110"
                      : bookingStep > s
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-400",
                  )}
                >
                  {bookingStep > s ? <Icon name="faCheck" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={classNames(
                      "h-0.5 w-10 rounded-full",
                      bookingStep > s ? "bg-emerald-500" : "bg-slate-100",
                    )}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onBookingSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {bookingStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">
                      {t("pages.appointmentspage.step1PatientSelection")}
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        setIsQuickAddingPatient(!isQuickAddingPatient)
                      }
                      className="text-brand-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                    >
                      {isQuickAddingPatient
                        ? t("pages.appointmentspage.backToSearch")
                        : t("pages.appointmentspage.addNewPatient")}
                    </button>
                  </div>

                  {!isQuickAddingPatient ? (
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        {t("pages.appointmentspage.searchPatient2")}
                      </label>
                      <select
                        {...register("patientId")}
                        className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-brand-500 transition-all appearance-none"
                      >
                        <option value="">
                          {t(
                            "pages.appointmentspage.chooseAPatientFromRegistry",
                          )}
                        </option>
                        {patientsData?.data.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-4 p-5 rounded-[24px] bg-slate-50 border-2 border-slate-100">
                      <Input
                        label={t("pages.appointmentspage.patientFullName")}
                        {...register("newPatientName")}
                        placeholder={t("pages.appointmentspage.enterFullName")}
                      />
                      <Input
                        label={t("pages.appointmentspage.phoneNumber")}
                        {...register("newPatientPhone")}
                        placeholder={t("pages.appointmentspage.01xxxxxxxxx")}
                      />
                      <Button
                        onClick={handleQuickAddPatient}
                        className="w-full h-12"
                      >
                        {t("pages.appointmentspage.registerSelect")}
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-end pt-6">
                    <Button
                      onClick={() => selectedPatientId && setBookingStep(2)}
                      disabled={!selectedPatientId}
                      className="px-8 h-12"
                    >
                      {t("pages.appointmentspage.continueToDoctor")}
                    </Button>
                  </div>
                </motion.div>
              )}

              {bookingStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                  className="space-y-6"
                >
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">
                    {t("pages.appointmentspage.step2MedicalStaffService")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        {t("pages.appointmentspage.assignDoctor")}
                      </label>
                      <select
                        {...register("doctorId", {
                          required: t(
                            "pages.appointmentspage.doctorIsRequired",
                          ),
                        })}
                        className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-brand-500 transition-all appearance-none"
                      >
                        <option value="">
                          {t("pages.appointmentspage.selectConsultant")}
                        </option>
                        {doctorsData?.data.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.specialty})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        {t("pages.appointmentspage.serviceType")}
                      </label>
                      <select
                        {...register("serviceId", {
                          required: t(
                            "pages.appointmentspage.serviceIsRequired",
                          ),
                        })}
                        className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-brand-500 transition-all appearance-none"
                      >
                        <option value="">
                          {t("pages.appointmentspage.chooseService")}
                        </option>
                        {servicesData?.data.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} (${s.price})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-between pt-6 border-t border-slate-50">
                    <Button variant="ghost" onClick={() => setBookingStep(1)}>
                      {t("pages.appointmentspage.back")}
                    </Button>
                    <Button
                      onClick={() =>
                        selectedDoctorId &&
                        selectedServiceId &&
                        setBookingStep(3)
                      }
                      disabled={!selectedDoctorId || !selectedServiceId}
                      className="px-8 h-12"
                    >
                      {t("pages.appointmentspage.pickSchedule")}
                    </Button>
                  </div>
                </motion.div>
              )}

              {bookingStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                  className="space-y-6"
                >
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">
                    {t("pages.appointmentspage.step3DateTime")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label={t("pages.appointmentspage.dateLabel")}
                      type="date"
                      {...register("date", {
                        required: t("pages.appointmentspage.dateIsRequired3"),
                      })}
                      className="h-14"
                    />
                    <Input
                      label={t("pages.appointmentspage.timeLabel")}
                      type="time"
                      {...register("time", {
                        required: t("pages.appointmentspage.timeIsRequired3"),
                      })}
                      className="h-14"
                    />
                  </div>
                  <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-2 flex items-center gap-2">
                      <Icon name="faCircleInfo" />
                      {t("pages.appointmentspage.availabilityCheck")}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {t("pages.appointmentspage.checkingConflictsForDr", {
                        name: selectedDoctor?.name || "",
                      })}
                    </p>
                  </div>
                  <div className="flex justify-between pt-6 border-t border-slate-50">
                    <Button variant="ghost" onClick={() => setBookingStep(2)}>
                      {t("pages.appointmentspage.back2")}
                    </Button>
                    <Button
                      onClick={() =>
                        selectedDate && selectedTime && setBookingStep(4)
                      }
                      disabled={!selectedDate || !selectedTime}
                      className="px-8 h-12"
                    >
                      {t("pages.appointmentspage.finalSummary")}
                    </Button>
                  </div>
                </motion.div>
              )}

              {bookingStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                  className="space-y-6"
                >
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">
                    {t("pages.appointmentspage.step4FinalConfirmation")}
                  </h4>
                  <div className="rounded-[24px] border-2 border-slate-100 bg-slate-50/50 p-6 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {t("pages.appointmentspage.patient2")}
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {selectedPatient?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {t("pages.appointmentspage.doctor")}
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {selectedDoctor?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {t("pages.appointmentspage.service")}
                      </span>
                      <span className="text-sm font-black text-brand-600">
                        {selectedService?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {t("pages.appointmentspage.schedule2")}
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {t("pages.appointmentspage.scheduleSummary", {
                          date: selectedDate,
                          time: selectedTime,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-6 border-t border-slate-50">
                    <Button variant="ghost" onClick={() => setBookingStep(3)}>
                      {t("pages.appointmentspage.back3")}
                    </Button>
                    <Button type="submit" className="px-10 h-12 shadow-halo">
                      {t("pages.appointmentspage.confirmBook")}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </Modal>
    </div>
  );
}
export default AppointmentsPage;
