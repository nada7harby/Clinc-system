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

function AppointmentsPage() {
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
    doctorId: doctorFilter === "all" ? (user.role === ROLES.DOCTOR ? user.id : "") : doctorFilter,
    ...(user.role === ROLES.PATIENT ? { patientId: user.id } : {}),
  };

  const { data: appointmentsData, isLoading } = useAppointments(queryParams);
  const { data: doctorsData } = useUsers({ role: ROLES.DOCTOR });
  const { data: patientsData } = usePatients();
  const { data: servicesData } = useQuery({ queryKey: ["services"], queryFn: () => servicesApi.list() });

  const { mutate: cancelAppt } = useCancelAppointment();
  const { mutate: updateStatus } = useUpdateAppointmentStatus();
  const { mutate: updateAppt } = useUpdateAppointment();
  const { mutate: createAppt } = useCreateAppointment();


  const monthLabel = monthCursor.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
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
    if (!monthAppointments.length) return { total: 0, pending: 0, confirmed: 0 };
    return {
      total: monthAppointments.length,
      pending: monthAppointments.filter((a) => a.status === "pending").length,
      confirmed: monthAppointments.filter((a) => a.status === "confirmed").length,
    };
  }, [monthAppointments]);

  const daysGrid = useMemo(() => {
    const start = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 42 }, (_, idx) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + idx);
      return day;
    });
  }, [monthCursor]);

  const handleEditOpen = (appt) => {
    setEditingAppointment(appt);
    reset({
      date: appt.date,
      time: appt.time,
      notes: appt.notes || ""
    });
  };

  const openBookingForDate = (dateKey) => {
    setBookingDate(dateKey);
    setActiveDay(null);
    setIsBookingOpen(true);
    reset({ date: dateKey });
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

  const selectedPatient = useMemo(() => patientsData?.data.find(p => p.id === selectedPatientId), [patientsData, selectedPatientId]);
  const selectedDoctor = useMemo(() => doctorsData?.data.find(d => d.id === selectedDoctorId), [doctorsData, selectedDoctorId]);
  const selectedService = useMemo(() => servicesData?.data.find(s => s.id === selectedServiceId), [servicesData, selectedServiceId]);

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
      }
    });
  };

  const onEditSubmit = (data) => {
    updateAppt({ id: editingAppointment.id, data }, {
      onSuccess: () => setEditingAppointment(null)
    });
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
    updateAppt({ id: apptId, data: { date: dateKey } });
  };

  const handleStartSession = (appt) => {
    updateStatus({ id: appt.id, status: APPOINTMENT_STATUS.CONFIRMED });
    navigate(`${ROUTES.doctorSession}/${appt.id}`);
  };

  const columns = [
    {
      header: "Patient",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs border border-brand-100">
            {row.patientName?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-none">{row.patientName}</p>
            <p className="mt-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {row.patientId}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Schedule",
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
      header: "Status",
      render: (row) => (
        <Badge tone={STATUS_COLORS[row.status] || "secondary"} className="uppercase font-black text-[10px] tracking-widest">
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          {user.role === ROLES.DOCTOR ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartSession(row)}
                disabled={row.status === APPOINTMENT_STATUS.CONFIRMED || row.status === APPOINTMENT_STATUS.COMPLETED}
                className="h-9"
              >
                <Icon name="faPlay" className="mr-2" />
                Start Session
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => updateStatus({ id: row.id, status: APPOINTMENT_STATUS.COMPLETED })}
                disabled={row.status === APPOINTMENT_STATUS.COMPLETED}
                className="h-9"
              >
                <Icon name="faCheck" className="mr-2" />
                Completed
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { if (confirm("Cancel this appointment?")) cancelAppt(row.id); }}
                className="h-9 text-rose-500 hover:bg-rose-50"
              >
                <Icon name="faXmark" className="mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => handleEditOpen(row)} className="h-8 w-8 p-0 rounded-lg"><Icon name="faPen" /></Button>
              <Button variant="ghost" size="sm" onClick={() => { if (confirm("Cancel?")) cancelAppt(row.id); }} className="h-8 w-8 p-0 rounded-lg hover:text-rose-500"><Icon name="faTimes" /></Button>
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
    
    createPatient({ name, phone }, {
      onSuccess: (newP) => {
        setValue("patientId", newP.id);
        setIsQuickAddingPatient(false);
      }
    });
  };

  const handleBookingClose = () => {
    setIsBookingOpen(false);
    setBookingStep(1);
    reset();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Premium Header with Mini Analytics */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 rounded-full bg-brand-500 animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Clinical Hub • {monthLabel}</span>
           </div>
           <h1 className="text-5xl font-black tracking-tight text-slate-950 uppercase">
             {user.role === ROLES.DOCTOR ? "My Appointments" : "Scheduling"}
           </h1>
        </div>

        <div className="flex items-center gap-6 bg-white/50 backdrop-blur-xl p-6 rounded-[32px] border border-white shadow-glass">
           <div className="text-center px-4 border-r border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
              <p className="text-xl font-black text-slate-900">{stats.total}</p>
           </div>
           <div className="text-center px-4 border-r border-slate-100">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Pending</p>
              <p className="text-xl font-black text-slate-900">{stats.pending}</p>
           </div>
           <div className="text-center px-4">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Confirmed</p>
              <p className="text-xl font-black text-slate-900">{stats.confirmed}</p>
           </div>
            {user.role === ROLES.PATIENT ? (
               <Link to={ROUTES.bookAppointment}>
                 <Button className="h-14 px-8 rounded-2xl shadow-xl shadow-brand-500/30 gap-3 ml-4">
                    <Icon name="faPlus" />
                    Book Now
                 </Button>
               </Link>
            ) : (
               <Button 
                  onClick={() => setIsBookingOpen(true)}
                  className="h-14 px-8 rounded-2xl shadow-xl shadow-brand-500/30 gap-3 ml-4"
               >
                  <Icon name="faPlus" />
                  New Booking
               </Button>
            )}
        </div>
      </header>

      {/* Filters + Navigation */}
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md py-4 -mx-4 px-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200/50">
        <div className="flex items-center gap-2 rounded-2xl bg-white p-1 border border-slate-200 shadow-sm">
          {["Month", "List"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v.toLowerCase())}
              className={classNames(
                "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                view === v.toLowerCase()
                  ? "bg-slate-950 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50",
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user.role !== ROLES.PATIENT && (
            <div className="relative">
              <Icon name="faSearch" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search patient..."
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
              <option value="all">All Doctors</option>
              {doctorsData?.data.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </select>
          )}
          <select
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold outline-none focus:ring-4 focus:ring-brand-500/10"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMonthCursor(new Date())}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
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
              onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
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
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Card className="p-0 overflow-hidden" variant="premium">
                <Table columns={columns} data={appointmentsData?.data} isLoading={isLoading} />
              </Card>
            </motion.div>
          )}

          {view === "month" && (
            <motion.div key="month" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
              <Card className="p-0" variant="premium">
                <div className="grid grid-cols-7 border-b border-slate-100 bg-white/70 px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px bg-slate-100">
                  {daysGrid.map((day) => {
                    const dateKey = getDateKey(day);
                    const isToday = dateKey === todayKey;
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isCurrentMonth = day.getMonth() === monthCursor.getMonth();
                    const dayAppointments = appointmentsByDate[dateKey] || [];
                    const visibleAppointments = dayAppointments.slice(0, 3);
                    const overflowCount = dayAppointments.length - visibleAppointments.length;

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
                          <span className={classNames(
                            "text-[11px] font-black",
                            isToday ? "text-brand-600" : "text-slate-500",
                          )}>
                            {day.getDate()}
                          </span>
                          {isToday && (
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-500">Today</span>
                          )}
                        </div>

                        <div className="mt-2 space-y-2">
                          {visibleAppointments.map((appt) => (
                            <button
                              key={appt.id}
                              draggable
                              onDragStart={(event) => event.dataTransfer.setData("text/plain", appt.id)}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleEditOpen(appt);
                              }}
                              className={classNames(
                                "group/mini relative w-full rounded-xl border-l-4 px-2.5 py-2 text-left text-[11px] font-bold transition-all hover:shadow-sm",
                                statusStyles[appt.status] || "border-brand-500/60 bg-brand-50/60 text-brand-700",
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className="rounded-md bg-white/70 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                  {appt.time}
                                </span>
                                <span className="truncate">{appt.patientName}</span>
                              </div>
                              <div className="pointer-events-none absolute left-2 top-full z-20 mt-2 w-48 rounded-xl border border-slate-100 bg-white p-3 text-[10px] font-semibold text-slate-500 opacity-0 shadow-lg transition-all group-hover/mini:opacity-100">
                                <p className="text-slate-900 font-bold">{appt.patientName}</p>
                                <p className="mt-1">{appt.serviceName}</p>
                                <p>{appt.doctorName}</p>
                                <p className="mt-1 uppercase tracking-widest text-[9px]">{appt.status}</p>
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
                              +{overflowCount} more
                            </button>
                          )}
                        </div>

                        {dayAppointments.length === 0 && (
                          <div className="absolute bottom-3 left-3 text-[9px] font-black uppercase tracking-[0.3em] text-slate-200 opacity-0 transition-all group-hover:opacity-100">
                            + Add Appointment
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
      <Modal isOpen={!!editingAppointment} onClose={() => setEditingAppointment(null)} title="Modify Appointment" size="md">
         {editingAppointment && (
           <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-6">
                 <Input label="Revised Date" type="date" {...register("date", { required: "Date is required" })} />
                 <Input label="Revised Time" type="time" {...register("time", { required: "Time is required" })} />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-700 ml-1">Clinical Notes</label>
                 <textarea className="w-full h-32 rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-500 transition-all" {...register("notes")} />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                 <Button variant="ghost" onClick={() => setEditingAppointment(null)}>Cancel</Button>
                 <Button type="submit">Save Changes</Button>
              </div>
           </form>
         )}
      </Modal>

      <Modal isOpen={!!activeDay} onClose={() => setActiveDay(null)} title="Day Details" size="lg">
        {activeDay && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Appointments</p>
                <p className="text-lg font-bold text-slate-900">{activeDay}</p>
              </div>
              <Button onClick={() => openBookingForDate(activeDay)} className="gap-2">
                <Icon name="faPlus" />
                Add Appointment
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
                    statusStyles[appt.status] || "border-brand-500/60 bg-brand-50/60 text-brand-700",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-slate-900">{appt.patientName}</p>
                      <p className="text-xs font-medium text-slate-500">{appt.serviceName} • {appt.doctorName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">{appt.time}</span>
                      {user.role === ROLES.DOCTOR && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleStartSession(appt);
                            }}
                            disabled={appt.status === APPOINTMENT_STATUS.CONFIRMED || appt.status === APPOINTMENT_STATUS.COMPLETED}
                          >
                            <Icon name="faPlay" />
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              updateStatus({ id: appt.id, status: APPOINTMENT_STATUS.COMPLETED });
                            }}
                            disabled={appt.status === APPOINTMENT_STATUS.COMPLETED}
                          >
                            <Icon name="faCheck" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (confirm("Cancel this appointment?")) cancelAppt(appt.id);
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
      <Modal isOpen={isBookingOpen} onClose={handleBookingClose} title="Smart Appointment Booking" size="lg">
         <div className="pt-4">
            {/* Step Indicator */}
            <div className="mb-8 flex items-center justify-center gap-4">
               {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                     <div className={classNames(
                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                        bookingStep === s ? "bg-brand-500 text-white shadow-halo scale-110" : 
                        bookingStep > s ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                     )}>
                        {bookingStep > s ? <Icon name="faCheck" /> : s}
                     </div>
                     {s < 4 && <div className={classNames("h-0.5 w-10 rounded-full", bookingStep > s ? "bg-emerald-500" : "bg-slate-100")}></div>}
                  </div>
               ))}
            </div>

            <form onSubmit={handleSubmit(onBookingSubmit)} className="space-y-6">
               <AnimatePresence mode="wait">
                  {bookingStep === 1 && (
                     <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                           <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Step 1: Patient Selection</h4>
                           <button type="button" onClick={() => setIsQuickAddingPatient(!isQuickAddingPatient)} className="text-brand-600 text-[10px] font-black uppercase tracking-widest hover:underline">
                             {isQuickAddingPatient ? "← Back to Search" : "+ Add New Patient"}
                           </button>
                        </div>
                        
                        {!isQuickAddingPatient ? (
                          <div className="space-y-2">
                             <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Search Patient</label>
                             <select {...register("patientId")} className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-brand-500 transition-all appearance-none">
                                <option value="">Choose a patient from registry...</option>
                                {patientsData?.data.map(p => <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>)}
                             </select>
                          </div>
                        ) : (
                          <div className="space-y-4 p-5 rounded-[24px] bg-slate-50 border-2 border-slate-100">
                             <Input label="Patient Full Name" {...register("newPatientName")} placeholder="Enter full name" />
                             <Input label="Phone Number" {...register("newPatientPhone")} placeholder="01xxxxxxxxx" />
                             <Button onClick={handleQuickAddPatient} className="w-full h-12">Register & Select</Button>
                          </div>
                        )}

                        <div className="flex justify-end pt-6">
                           <Button onClick={() => selectedPatientId && setBookingStep(2)} disabled={!selectedPatientId} className="px-8 h-12">Continue to Doctor</Button>
                        </div>
                     </motion.div>
                  )}

                  {bookingStep === 2 && (
                     <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Step 2: Medical Staff & Service</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Assign Doctor</label>
                              <select {...register("doctorId", { required: "Doctor is required" })} className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-brand-500 transition-all appearance-none">
                                 <option value="">Select consultant...</option>
                                 {doctorsData?.data.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>)}
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Service Type</label>
                              <select {...register("serviceId", { required: "Service is required" })} className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-brand-500 transition-all appearance-none">
                                 <option value="">Choose service...</option>
                                 {servicesData?.data.map(s => <option key={s.id} value={s.id}>{s.name} (${s.price})</option>)}
                              </select>
                           </div>
                        </div>
                        <div className="flex justify-between pt-6 border-t border-slate-50">
                           <Button variant="ghost" onClick={() => setBookingStep(1)}>Back</Button>
                           <Button onClick={() => selectedDoctorId && selectedServiceId && setBookingStep(3)} disabled={!selectedDoctorId || !selectedServiceId} className="px-8 h-12">Pick Schedule</Button>
                        </div>
                     </motion.div>
                  )}

                  {bookingStep === 3 && (
                     <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Step 3: Date & Time</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <Input label="Date" type="date" {...register("date", { required: "Date is required" })} className="h-14" />
                           <Input label="Time" type="time" {...register("time", { required: "Time is required" })} className="h-14" />
                        </div>
                        <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100">
                           <p className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-2 flex items-center gap-2">
                              <Icon name="faCircleInfo" />
                              Availability Check
                           </p>
                           <p className="text-xs font-medium text-slate-500">Checking conflicts for Dr. {selectedDoctor?.name}...</p>
                        </div>
                        <div className="flex justify-between pt-6 border-t border-slate-50">
                           <Button variant="ghost" onClick={() => setBookingStep(2)}>Back</Button>
                           <Button onClick={() => selectedDate && selectedTime && setBookingStep(4)} disabled={!selectedDate || !selectedTime} className="px-8 h-12">Final Summary</Button>
                        </div>
                     </motion.div>
                  )}

                  {bookingStep === 4 && (
                     <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Step 4: Final Confirmation</h4>
                        <div className="rounded-[24px] border-2 border-slate-100 bg-slate-50/50 p-6 space-y-4">
                           <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patient</span>
                              <span className="text-sm font-black text-slate-900">{selectedPatient?.name}</span>
                           </div>
                           <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Doctor</span>
                              <span className="text-sm font-black text-slate-900">{selectedDoctor?.name}</span>
                           </div>
                           <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service</span>
                              <span className="text-sm font-black text-brand-600">{selectedService?.name}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Schedule</span>
                              <span className="text-sm font-black text-slate-900">{selectedDate} @ {selectedTime}</span>
                           </div>
                        </div>
                        <div className="flex justify-between pt-6 border-t border-slate-50">
                           <Button variant="ghost" onClick={() => setBookingStep(3)}>Back</Button>
                           <Button type="submit" className="px-10 h-12 shadow-halo">Confirm & Book</Button>
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
