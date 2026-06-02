import { useAuthStore } from "@/store/authStore";
import { useTodayAppointments } from "@/hooks/useAppointments";
import { Card, Badge, Button, Icon } from "@/components";
import StatCard from "@/features/dashboard/StatCard";
import { motion } from "framer-motion";
import { classNames } from "@/utils";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
function DoctorDashboard() {
  const {
    t
  } = useTranslation();
  const {
    user
  } = useAuthStore();
  const {
    data: appointments,
    isLoading
  } = useTodayAppointments(user.id);
  const patientQueue = [{
    name: "Ava Moore",
    reason: "Cardiac follow-up",
    status: "waiting",
    time: "09:30"
  }, {
    name: "Marcus Hill",
    reason: "Diagnostics review",
    status: "in-progress",
    time: "10:00"
  }, {
    name: "Lina Ortiz",
    reason: "Prescription refill",
    status: "completed",
    time: "10:30"
  }];
  const handleTimelineMode = () => {
    toast("Timeline mode is loading...");
  };
  const handleFullCalendar = () => {
    toast("Opening full calendar...");
  };
  const handleSaveDraft = () => {
    toast.success(t("pages.doctor.doctordashboard.clinicalNotesDraftSaved"));
  };
  const handleOpenFile = patientName => {
    toast(`Opening ${patientName}'s file...`);
  };
  const handleQuickAction = label => {
    toast(`Starting ${label}...`);
  };
  return <div className="space-y-10 pb-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="hud-chip">{t("pages.doctor.doctordashboard.doctorWorkspace")}</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 leading-none">{t("pages.doctor.doctordashboard.welcomeBack")}{" "}
            <span className="text-brand-500">{t("pages.doctor.doctordashboard.dr")}{user.name.split(" ").pop()}
            </span>
          </h1>
          <p className="mt-3 text-lg font-medium text-slate-500">{t("pages.doctor.doctordashboard.youHave")}{appointments?.length || 0}{t("pages.doctor.doctordashboard.patientsScheduledForToday")}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="md" className="gap-2" onClick={handleTimelineMode}>
            <Icon name="faClock" />{t("pages.doctor.doctordashboard.timelineMode")}</Button>
          <Button variant="secondary" size="md" className="gap-2" onClick={handleFullCalendar}>
            <Icon name="faCalendar" />{t("pages.doctor.doctordashboard.fullCalendar")}</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <StatCard title={t("pages.doctor.doctordashboard.activeConsultations")} value={appointments?.length || 0} icon="faStethoscope" />
        <StatCard title={t("pages.doctor.doctordashboard.patientFiles")} value={42} icon="faFolderOpen" variant="success" />
        <StatCard title={t("pages.doctor.doctordashboard.pendingReports")} value={5} icon="faFileMedicalAlt" variant="warning" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2" title={t("pages.doctor.doctordashboard.dailySchedule")} description="Your upcoming patient queue for today.">
          <div className="mt-8 space-y-6">
            {isLoading ? <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-slate-50"></div>)}
              </div> : appointments?.length > 0 ? appointments.map((appt, i) => <motion.div key={appt.id} initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: i * 0.1
          }} className="group flex items-start gap-6 rounded-3xl border border-slate-100/70 bg-white/70 p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                  <div className="flex flex-col items-center gap-1 min-w-[70px]">
                    <span className="text-lg font-extrabold text-slate-900 leading-none">
                      {appt.time}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {t("pages.doctor.doctordashboard.am")}
                    </span>
                  </div>

                  <div className="h-10 w-px bg-slate-200 self-center hidden md:block"></div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {appt.patientName}
                        </h4>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {appt.serviceName}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge tone={appt.status === "confirmed" ? "primary" : "success"}>
                          {appt.status}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl bg-white border border-slate-100 shadow-sm hover:text-brand-600" onClick={() => handleOpenFile(appt.patientName)}>
                          <Icon name="faChevronRight" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>) : <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-4">
                  <Icon name="faCalendarTimes" size="lg" />
                </div>
                <p className="text-slate-400 font-medium">{t("pages.doctor.doctordashboard.noAppointmentsRemainingForToday")}</p>
              </div>}
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="bg-brand-600 text-white border-none shadow-xl shadow-brand-600/30">
            <h3 className="text-xl font-bold mb-2">{t("pages.doctor.doctordashboard.emergencyHub")}</h3>
            <p className="text-brand-100 text-sm mb-6">{t("pages.doctor.doctordashboard.accessCriticalPatientInfoInstantlyDuringEmergencies")}</p>
            <div className="space-y-3">
              <Button variant="accent" className="w-full h-12 rounded-xl text-sm" onClick={() => toast("Searching patient files...")}>
                <Icon name="faSearch" className="mr-2" />{t("pages.doctor.doctordashboard.findPatientFile")}</Button>
              <Button variant="ghost" className="w-full text-white hover:bg-white/10 h-12 rounded-xl text-sm" onClick={() => toast("Connecting to duty manager...")}>
                <Icon name="faPhoneAlt" className="mr-2" />{t("pages.doctor.doctordashboard.dutyManager")}</Button>
            </div>
          </Card>

          <Card title={t("pages.doctor.doctordashboard.clinicalNotes")} description="Draft observations for later review.">
            <textarea placeholder={t("pages.doctor.doctordashboard.startTypingYourObservations")} className="mt-4 w-full h-40 rounded-2xl border border-slate-100/80 bg-white/70 p-4 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all" />
            <Button variant="primary" className="mt-4 w-full h-12 rounded-xl" onClick={handleSaveDraft}>{t("pages.doctor.doctordashboard.saveDraft")}</Button>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2" title={t("pages.doctor.doctordashboard.assignedPatients")} description="Quick access to active patient files.">
          <div className="mt-6 space-y-4">
            {patientQueue.map((patient, i) => <div key={i} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100/70 bg-white/80 p-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {patient.name}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {patient.reason}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={patient.status === "completed" ? "success" : patient.status === "waiting" ? "warning" : "primary"}>
                    {patient.status.replace("-", " ")}
                  </Badge>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {patient.time}
                  </span>
                  <Button variant="outline" size="sm" className="h-9" onClick={() => handleOpenFile(patient.name)}>{t("pages.doctor.doctordashboard.openFile")}</Button>
                </div>
              </div>)}
          </div>
        </Card>

        <Card title={t("pages.doctor.doctordashboard.quickActions")} description="Capture clinical data fast.">
          <div className="mt-6 space-y-4">
            {[{
            label: t("pages.doctor.doctordashboard.addDiagnosis"),
            icon: "faNotesMedical"
          }, {
            label: t("pages.doctor.doctordashboard.writePrescription"),
            icon: "faPrescription"
          }, {
            label: t("pages.doctor.doctordashboard.orderLab"),
            icon: "faVial"
          }].map((action, i) => <Button key={i} variant="outline" className="w-full justify-between" onClick={() => handleQuickAction(action.label)}>
                <span className="inline-flex items-center gap-2">
                  <Icon name={action.icon} />
                  {action.label}
                </span>
                <Icon name="faChevronRight" />
              </Button>)}
          </div>
        </Card>
      </div>
    </div>;
}
export default DoctorDashboard;
