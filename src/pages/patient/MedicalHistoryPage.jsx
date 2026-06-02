import { useMemo } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { useAuthStore } from "@/store/authStore";
import { Card, Icon, Badge, Button } from "@/components";
import { APPOINTMENT_STATUS } from "@/constants/appConstants";
import { motion } from "framer-motion";
import { classNames } from "@/utils";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
function MedicalHistoryPage() {
  const {
    t
  } = useTranslation();
  const {
    user
  } = useAuthStore();
  const {
    data: appointmentsData,
    isLoading
  } = useAppointments({
    patientId: user.id
  });
  const history = useMemo(() => {
    if (!appointmentsData?.data) return [];
    return appointmentsData.data.filter(a => a.status === APPOINTMENT_STATUS.COMPLETED).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [appointmentsData]);
  return <div className="space-y-10 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="hud-chip">{t("pages.patient.medicalhistorypage.healthLedger")}</span>
          <h1 className="mt-4 text-4xl font-black text-slate-900 uppercase tracking-tight">{t("pages.patient.medicalhistorypage.medicalHistory")}</h1>
          <p className="mt-2 text-slate-500 font-medium">{t("pages.patient.medicalhistorypage.timelineOfYourPastConsultationsDiagnosesAnd")}</p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="h-12 rounded-2xl gap-2" onClick={() => toast("Exporting medical history...")}>
            <Icon name="faFileExport" />{t("pages.patient.medicalhistorypage.export")}</Button>
          <Card className="p-4 flex items-center gap-4 bg-white/50 border-white shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Icon name="faFileMedical" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{t("pages.patient.medicalhistorypage.totalVisits")}</p>
              <p className="text-lg font-black text-slate-900 mt-1">
                {history.length}
              </p>
            </div>
          </Card>
        </div>
      </header>

      {isLoading ? <div className="py-20 text-center space-y-4">
          <div className="h-12 w-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t("pages.patient.medicalhistorypage.retrievingRecords")}</p>
        </div> : history.length === 0 ? <div className="flex flex-col items-center justify-center py-32 rounded-[40px] bg-slate-50 border-2 border-dashed border-slate-200">
          <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-slate-200 mb-6 shadow-sm">
            <Icon name="faHistory" className="text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-400">{t("pages.patient.medicalhistorypage.noMedicalHistoryFound")}</h3>
          <p className="text-slate-300 font-medium mt-1">{t("pages.patient.medicalhistorypage.yourVisitHistoryWillAppearHereOnce")}</p>
        </div> : <div className="relative space-y-12">
          {/* Vertical Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-[3px] bg-slate-200 md:left-1/2 md:-translate-x-1/2" />

          {history.map((visit, idx) => <motion.div key={visit.id} initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className={classNames("relative flex flex-col md:flex-row items-start gap-8", idx % 2 === 0 ? "md:flex-row-reverse" : "")}>
              {/* Timeline Marker */}
              <div className="absolute left-4 top-6 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-white bg-brand-500 shadow-halo md:left-1/2" />
              <div className="absolute left-4 top-6 z-0 h-10 w-10 -translate-x-1/2 rounded-full bg-brand-100/60 md:left-1/2" />

              <div className="w-full pl-6 md:w-[45%] md:pl-0">
                <Card variant="premium" className="group overflow-hidden border-slate-100 bg-white/80 transition-all hover:border-brand-200 hover:shadow-lg">
                  <div className="relative">
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-100/60 blur-2xl" />
                    <div className="relative flex items-start justify-between border-b border-slate-100 px-6 py-5">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{t("pages.patient.medicalhistorypage.visitDate")}</p>
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white">
                          <Icon name="faCalendarAlt" className="text-[10px]" />
                          {visit.date}
                        </div>
                      </div>
                      <Badge tone="success" className="uppercase font-black text-[9px]">{t("pages.patient.medicalhistorypage.completed")}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 px-6 py-5 sm:grid-cols-[1fr_1.2fr]">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("pages.patient.medicalhistorypage.service")}</p>
                        <p className="mt-1 text-lg font-black text-slate-900">
                          {visit.serviceName}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("pages.patient.medicalhistorypage.consultant")}</p>
                        <p className="mt-2 text-sm font-bold text-slate-900">
                          {visit.doctorName || "Assigned Doctor"}
                        </p>
                      </div>
                      {visit.diagnosis && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{t("pages.patient.medicalhistorypage.diagnosis")}</p>
                          <p className="mt-2 text-sm font-bold text-slate-900">
                            {visit.diagnosis}
                          </p>
                        </div>}
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("pages.patient.medicalhistorypage.clinicalNotes")}</p>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
                          {visit.notes || "Standard check-up completed. Patient stable."}
                        </p>
                      </div>

                      {visit.prescription && <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-600">{t("pages.patient.medicalhistorypage.prescription")}</p>
                          <p className="mt-2 text-sm font-bold text-slate-900">
                            "{visit.prescription}"
                          </p>
                        </div>}
                    </div>
                  </div>
                </Card>
              </div>

              <div className="hidden md:block w-[10%]" />
              <div className="hidden md:block w-[45%]">
                <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-sm">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-100/60 blur-2xl" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.patient.medicalhistorypage.caseSnapshot")}</p>
                      <p className="mt-2 text-lg font-black text-slate-900">
                        {visit.serviceName}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-700">{t("pages.patient.medicalhistorypage.completed2")}</span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Icon name="faStethoscope" className="text-[10px] text-brand-500" />{t("pages.patient.medicalhistorypage.symptoms")}</div>
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        {visit.symptoms || "Not recorded"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Icon name="faUserMd" className="text-[10px] text-brand-500" />{t("pages.patient.medicalhistorypage.consultant2")}</div>
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        {visit.doctorName || "Assigned Doctor"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Icon name="faReceipt" className="text-[10px] text-brand-500" />{t("pages.patient.medicalhistorypage.charge")}</div>
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        ${visit.price || 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Icon name="faClock" className="text-[10px] text-brand-500" />{t("pages.patient.medicalhistorypage.time")}</div>
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        {visit.time || "Time not set"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("pages.patient.medicalhistorypage.visitId")}</div>
                    <div className="text-xs font-semibold text-slate-600">
                      {visit.id}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>)}
        </div>}
    </div>;
}
export default MedicalHistoryPage;
