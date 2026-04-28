import { useMemo } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { useAuthStore } from "@/store/authStore";
import { Card, Icon, Badge } from "@/components";
import { APPOINTMENT_STATUS } from "@/constants/appConstants";
import { motion } from "framer-motion";
import { classNames } from "@/utils";

function MedicalHistoryPage() {
  const { user } = useAuthStore();
  const { data: appointmentsData, isLoading } = useAppointments({ patientId: user.id });

  const history = useMemo(() => {
    if (!appointmentsData?.data) return [];
    return appointmentsData.data
      .filter(a => a.status === APPOINTMENT_STATUS.COMPLETED)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [appointmentsData]);

  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="hud-chip">Health Ledger</span>
          <h1 className="mt-4 text-4xl font-black text-slate-900 uppercase tracking-tight">Medical History</h1>
          <p className="mt-2 text-slate-500 font-medium">
            Timeline of your past consultations, diagnoses, and medical notes.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Card className="p-4 flex items-center gap-4 bg-white/50 border-white shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Icon name="faFileMedical" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Visits</p>
              <p className="text-lg font-black text-slate-900 mt-1">{history.length}</p>
            </div>
          </Card>
        </div>
      </header>

      {isLoading ? (
        <div className="py-20 text-center space-y-4">
           <div className="h-12 w-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Retrieving Records...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 rounded-[40px] bg-slate-50 border-2 border-dashed border-slate-200">
           <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-slate-200 mb-6 shadow-sm">
             <Icon name="faHistory" className="text-3xl" />
           </div>
           <h3 className="text-xl font-bold text-slate-400">No medical history found</h3>
           <p className="text-slate-300 font-medium mt-1">Your visit history will appear here once you complete an appointment.</p>
        </div>
      ) : (
        <div className="relative space-y-12">
          {/* Vertical Timeline Line */}
          <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-1 bg-slate-100 -translate-x-1/2 hidden md:block" />

          {history.map((visit, idx) => (
            <motion.div 
              key={visit.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={classNames(
                "relative flex flex-col md:flex-row items-center gap-8",
                idx % 2 === 0 ? "md:flex-row-reverse" : ""
              )}
            >
              {/* Timeline Dot */}
              <div className="absolute left-6 md:left-1/2 h-4 w-4 rounded-full bg-brand-500 border-4 border-white shadow-halo -translate-x-1/2 z-10 hidden md:block" />

              <div className="w-full md:w-[45%]">
                <Card variant="premium" className="group hover:border-brand-500 transition-colors">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em]">{visit.date}</span>
                      <h3 className="text-xl font-black text-slate-900 mt-1">{visit.serviceName}</h3>
                    </div>
                    <Badge tone="success" className="uppercase font-black text-[9px]">Completed</Badge>
                  </div>

                    <div className="space-y-4">
                      {visit.diagnosis && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Diagnosis</p>
                          <p className="text-sm font-bold text-slate-900">{visit.diagnosis}</p>
                        </div>
                      )}

                      <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clinical Notes</p>
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                          {visit.notes || "Standard check-up completed. Patient stable."}
                        </p>
                      </div>

                      {visit.prescription && (
                        <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100">
                          <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1">Prescription</p>
                          <p className="text-sm font-bold text-slate-900 italic">"{visit.prescription}"</p>
                        </div>
                      )}
                    </div>
                </Card>
              </div>

              <div className="hidden md:block w-[10%]" />
              <div className="hidden md:block w-[45%]" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MedicalHistoryPage;
