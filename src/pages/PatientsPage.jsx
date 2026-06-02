import { useState } from "react";
import { usePatients, useDeletePatient } from "@/hooks/usePatients";
import { Table, Button, Badge, Card, Icon, Modal } from "@/components";
import { useAuthStore } from "@/store/authStore";
import { ROLES } from "@/constants/appConstants";
import { motion, AnimatePresence } from "framer-motion";
import { classNames } from "@/utils";
import { useTranslation } from "react-i18next";
function PatientsPage() {
  const {
    t
  } = useTranslation();
  const {
    user
  } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const {
    data: patientsData,
    isLoading
  } = usePatients({
    search: searchTerm
  });
  const {
    mutate: deletePatient
  } = useDeletePatient();
  const handleOpenProfile = patient => {
    setSelectedPatient(patient);
  };
  const columns = [{
    header: t("pages.patientspage.patientIdentity"),
    render: row => <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 shadow-sm border border-slate-200 group-hover:border-brand-500/20 transition-all">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-none">{row.name}</p>
            <p className="mt-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("pages.patientspage.dob")}{row.dob}
            </p>
          </div>
        </div>
  }, {
    header: t("pages.patientspage.contactIntelligence"),
    render: row => <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Icon name="faPhone" className="text-brand-500 text-[10px]" />
            {row.phone}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
            <Icon name="faEnvelope" className="text-slate-300 text-[10px]" />
            {row.email}
          </div>
        </div>
  }, {
    header: t("pages.patientspage.medicalContext"),
    render: row => <div className="flex flex-wrap gap-2">
          <Badge tone="primary" className="bg-brand-50 text-brand-700 border-brand-100 px-3">{t("pages.patientspage.type")}{row.bloodType}
          </Badge>
          {row.medicalHistory && <Badge tone="warning" className="px-3">{t("pages.patientspage.chronicles")}</Badge>}
        </div>
  }, {
    header: t("pages.patientspage.actions"),
    render: row => <div className="flex items-center gap-2">
          <Button variant="accent" size="sm" onClick={() => handleOpenProfile(row)} className="h-10 px-4 rounded-xl text-xs gap-2">
            <Icon name="faFolderOpen" />{t("pages.patientspage.medicalProfile")}</Button>
          {(user.role === ROLES.ADMIN || user.role === ROLES.RECEPTIONIST) && <Button variant="ghost" size="sm" onClick={() => {
        if (confirm(t("pages.patientspage.permanentlyArchiveThisPatientRecord"))) deletePatient(row.id);
      }} className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600">
              <Icon name="faTrash" />
            </Button>}
        </div>
  }];
  return <div className="space-y-10 pb-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">{t("pages.patientspage.patientRegistry")}</h1>
          <p className="mt-2 text-lg font-medium text-slate-500">{t("pages.patientspage.comprehensiveManagementOfDigitalHealthIdentitiesAnd")}</p>
        </div>
        {(user.role === ROLES.ADMIN || user.role === ROLES.RECEPTIONIST) && <Button className="h-12 px-8 rounded-2xl shadow-xl shadow-brand-500/20 gap-3">
            <Icon name="faUserPlus" />{t("pages.patientspage.intakeNewPatient")}</Button>}
      </div>

      <Card className="p-0 overflow-hidden" variant="premium">
        <div className="bg-slate-50/50 p-6 border-b border-slate-100">
          <div className="relative max-w-2xl">
            <Icon name="faSearch" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input type="text" placeholder={t("pages.patientspage.searchByNameBiometricIdPhoneOr")} className="h-12 w-full rounded-2xl border-2 border-transparent bg-white pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-brand-500/10 shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="p-4">
          <Table columns={columns} data={patientsData?.data} isLoading={isLoading} emptyMessage="No clinical records matching your parameters." />
        </div>
      </Card>

      {/* Patient Profile Modal (The Timeline) */}
      <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title={t("pages.patientspage.clinicalMedicalRecord")} size="lg">
        <AnimatePresence>
          {selectedPatient && <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} className="space-y-8 pt-4">
              <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="h-20 w-20 rounded-3xl bg-brand-500 text-white flex items-center justify-center text-3xl font-black shadow-glow">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none">
                    {selectedPatient.name}
                  </h2>
                  <p className="mt-2 text-sm font-bold text-slate-500">{t("pages.patientspage.idPat")}{selectedPatient.id.toUpperCase()}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Badge tone="primary">{t("pages.patientspage.blood")}{selectedPatient.bloodType}
                    </Badge>
                    <Badge tone="secondary">{t("pages.patientspage.gender")}{selectedPatient.gender}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Icon name="faNotesMedical" className="text-brand-500" />{t("pages.patientspage.medicalHistory")}</h3>
                  <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm min-h-[150px]">
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                      {selectedPatient.medicalHistory || "No historical medical conditions recorded for this patient."}
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Icon name="faClockRotateLeft" className="text-brand-500" />{t("pages.patientspage.timeline")}</h3>
                  <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                    {[{
                  date: "2024-06-15",
                  action: "General Check-up",
                  doctor: "Dr. Sarah",
                  type: "Clinical"
                }, {
                  date: "2024-04-10",
                  action: "Blood Test Results",
                  doctor: "System",
                  type: "Laboratory"
                }, {
                  date: "2024-01-20",
                  action: "Initial Registration",
                  doctor: "Admin",
                  type: "System"
                }].map((event, i) => <div key={i} className="relative pl-10">
                        <div className="absolute left-0 top-1 h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center z-10 shadow-sm">
                          <div className="h-2 w-2 rounded-full bg-brand-500"></div>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            {event.date}
                          </p>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">
                            {event.action}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{t("pages.patientspage.operator")}{event.doctor} • {event.type}
                          </p>
                        </div>
                      </div>)}
                  </div>
                </section>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-50">
                <Button variant="primary" onClick={() => setSelectedPatient(null)} className="h-12 px-10 rounded-2xl">{t("pages.patientspage.closeRecord")}</Button>
              </div>
            </motion.div>}
        </AnimatePresence>
      </Modal>
    </div>;
}
export default PatientsPage;
