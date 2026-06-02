import { useState, useMemo, useCallback } from "react";
import { Card, Button, Icon, Badge, Table, Modal, Input, PaymentModal } from "@/components";
import { useAppointments, useUpdateAppointmentStatus, useCancelAppointment } from "@/hooks/useAppointments";
import { useUsers } from "@/hooks/useUsers";
import { usePatients, useCreatePatient } from "@/hooks/usePatients";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { classNames } from "@/utils";
import { APPOINTMENT_STATUS, STATUS_COLORS, ROLES, ROUTES, PAYMENT_STATUS_COLORS } from "@/constants/appConstants";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
const MotionDiv = motion.div;

// ── Clinic Room/Stage Definitions ─────────────────────────────────────────────
const QUEUE_STAGES = [{
  id: "waiting",
  label: "Waiting Room",
  labelKey: "pages.receptionist.receptionistdashboard.queueStages.waiting",
  icon: "faCouch",
  color: "amber"
}, {
  id: "triage",
  label: "Triage / Vitals",
  labelKey: "pages.receptionist.receptionistdashboard.queueStages.triage",
  icon: "faHeartPulse",
  color: "blue"
}, {
  id: "doctor",
  label: "Doctor's Office",
  labelKey: "pages.receptionist.receptionistdashboard.queueStages.doctor",
  icon: "faUserDoctor",
  color: "brand"
}, {
  id: "checkout",
  label: "Checkout",
  labelKey: "pages.receptionist.receptionistdashboard.queueStages.checkout",
  icon: "faCashRegister",
  color: "emerald"
}];

// ── Insurance Provider Database (simulated) ───────────────────────────────────
const INSURANCE_PROVIDERS = [{
  id: "axa",
  name: "AXA Insurance",
  coverageRate: 0.80,
  copayFlat: 50
}, {
  id: "bupa",
  name: "Bupa Health",
  coverageRate: 0.70,
  copayFlat: 75
}, {
  id: "metlife",
  name: "MetLife",
  coverageRate: 0.85,
  copayFlat: 30
}, {
  id: "globemed",
  name: "Globemed Alliance",
  coverageRate: 0.60,
  copayFlat: 100
}];
function ReceptionistDashboard() {
  const {
    t
  } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAppointmentForPayment, setSelectedAppointmentForPayment] = useState(null);
  const [activeTab, setActiveTab] = useState("schedule"); // schedule | queue | insurance

  // Drag-and-Drop Queue State (local simulation with patient cards)
  const [queuePatients, setQueuePatients] = useState([{
    id: "q1",
    name: "Ava Moore",
    service: "Cardiac Follow-up",
    doctor: "Dr. Ahmed",
    time: "09:30",
    stage: "waiting"
  }, {
    id: "q2",
    name: "Marcus Hill",
    service: "Diagnostics Review",
    doctor: "Dr. Sarah",
    time: "10:00",
    stage: "waiting"
  }, {
    id: "q3",
    name: "Lina Ortiz",
    service: "Prescription Refill",
    doctor: "Dr. Ahmed",
    time: "10:30",
    stage: "triage"
  }, {
    id: "q4",
    name: "Omar Khalil",
    service: "Dermatology Check",
    doctor: "Dr. Sarah",
    time: "11:00",
    stage: "doctor"
  }, {
    id: "q5",
    name: "Fatma Hassan",
    service: "Pediatrics Visit",
    doctor: "Dr. Ahmed",
    time: "11:30",
    stage: "checkout"
  }]);
  const [draggedPatient, setDraggedPatient] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Insurance POS State
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [selectedInsuranceProvider, setSelectedInsuranceProvider] = useState("");
  const [insurancePolicyId, setInsurancePolicyId] = useState("");
  const [insuranceVerified, setInsuranceVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copayResult, setCopayResult] = useState(null);
  const [insuranceServiceAmount, setInsuranceServiceAmount] = useState("300");

  // OCR Scanner State
  const [ocrState, setOcrState] = useState("idle"); // idle, scanning, parsing, done
  const [ocrLogs, setOcrLogs] = useState([]);
  const [ocrResult, setOcrResult] = useState(null);
  const {
    data: appointmentsData,
    isLoading
  } = useAppointments();
  const {
    data: doctorsData
  } = useUsers({
    role: ROLES.DOCTOR
  });
  const {
    data: patientsData
  } = usePatients();
  const {
    mutate: updateStatus
  } = useUpdateAppointmentStatus();
  const {
    mutate: cancelAppt
  } = useCancelAppointment();
  const {
    mutate: createPatient
  } = useCreatePatient();
  const {
    register: patientRegister,
    handleSubmit: patientSubmit,
    reset: patientReset,
    setValue: setPatientValue
  } = useForm();

  // Stats calculation (Today's focus)
  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = useMemo(() => {
    if (!appointmentsData?.data) return [];
    return appointmentsData.data.filter(a => a.date === today);
  }, [appointmentsData, today]);
  const stats = useMemo(() => {
    const apps = todayAppointments;
    return {
      total: apps.length,
      confirmed: apps.filter(a => a.status === APPOINTMENT_STATUS.CONFIRMED).length,
      pending: apps.filter(a => a.status === APPOINTMENT_STATUS.PENDING).length,
      cancelled: apps.filter(a => a.status === APPOINTMENT_STATUS.CANCELLED).length,
      availableSlots: 20 - apps.length
    };
  }, [todayAppointments]);
  const financialStats = useMemo(() => {
    const apps = todayAppointments;
    let expected = 0,
      collected = 0;
    apps.forEach(a => {
      if (a.status !== APPOINTMENT_STATUS.CANCELLED) {
        expected += parseFloat(a.price) || 0;
        collected += parseFloat(a.paidAmount) || 0;
      }
    });
    return {
      expected,
      collected,
      pending: expected - collected
    };
  }, [todayAppointments]);
  const filteredAppointments = useMemo(() => {
    if (!todayAppointments) return [];
    return todayAppointments.filter(a => a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || a.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [todayAppointments, searchTerm]);
  const handlePatientCreate = data => {
    createPatient(data, {
      onSuccess: () => {
        setIsNewPatientModalOpen(false);
        patientReset();
        setOcrState("idle");
        setOcrLogs([]);
        setOcrResult(null);
      }
    });
  };
  const handleCheckIn = id => {
    updateStatus({
      id,
      status: APPOINTMENT_STATUS.CONFIRMED
    });
    toast.success(t("pages.receptionist.receptionistdashboard.patientCheckedInSuccessfully"));
  };

  // ── Drag-and-Drop Handlers ────────────────────────────────────────────────
  const handleDragStart = useCallback(patient => {
    setDraggedPatient(patient);
  }, []);
  const handleDragOver = useCallback((e, stageId) => {
    e.preventDefault();
    setDragOverStage(stageId);
  }, []);
  const handleDragLeave = useCallback(() => {
    setDragOverStage(null);
  }, []);
  const handleDrop = useCallback(stageId => {
    if (draggedPatient && draggedPatient.stage !== stageId) {
      setQueuePatients(prev => prev.map(p => p.id === draggedPatient.id ? {
        ...p,
        stage: stageId
      } : p));
      const stage = QUEUE_STAGES.find(s => s.id === stageId);
      const stageLabel = stage ? t(stage.labelKey, {
        defaultValue: stage.label
      }) : stageId;
      toast.success(t("pages.receptionist.receptionistdashboard.patientMovedToStage", {
        patientName: draggedPatient.name,
        stageLabel
      }));
    }
    setDraggedPatient(null);
    setDragOverStage(null);
  }, [draggedPatient, t]);

  // ── Insurance Verification & Copay Calculation ────────────────────────────
  const handleVerifyInsurance = () => {
    if (!selectedInsuranceProvider || !insurancePolicyId.trim()) {
      toast.error(t("pages.receptionist.receptionistdashboard.pleaseSelectAProviderAndEnterA"));
      return;
    }
    setIsVerifying(true);
    setCopayResult(null);
    setTimeout(() => {
      const provider = INSURANCE_PROVIDERS.find(p => p.id === selectedInsuranceProvider);
      const serviceAmt = parseFloat(insuranceServiceAmount) || 0;
      const insurancePays = Math.min(serviceAmt, serviceAmt * provider.coverageRate);
      const patientCopay = Math.max(provider.copayFlat, serviceAmt - insurancePays);
      setCopayResult({
        providerName: provider.name,
        policyId: insurancePolicyId,
        serviceAmount: serviceAmt,
        coverageRate: (provider.coverageRate * 100).toFixed(0),
        insurancePays: insurancePays.toFixed(2),
        patientCopay: patientCopay.toFixed(2),
        approvalRef: `INS-${Math.floor(100000 + Math.random() * 900000)}`
      });
      setInsuranceVerified(true);
      setIsVerifying(false);
      toast.success(t("pages.receptionist.receptionistdashboard.insuranceVerifiedCopayCalculated"));
    }, 1500);
  };
  const resetInsuranceModal = () => {
    setSelectedInsuranceProvider("");
    setInsurancePolicyId("");
    setInsuranceVerified(false);
    setCopayResult(null);
    setInsuranceServiceAmount("300");
    setIsInsuranceModalOpen(false);
  };

  // ── OCR ID Scanner Simulation ─────────────────────────────────────────────
  const handleStartOCR = () => {
    setOcrState("scanning");
    setOcrLogs(["[0.0s] 📸 Activating camera module..."]);
    setOcrResult(null);
    const addLog = (msg, delay) => new Promise(resolve => {
      setTimeout(() => {
        setOcrLogs(prev => [...prev, msg]);
        resolve();
      }, delay);
    });
    addLog("[0.5s] 📷 Camera feed detected. Aligning document edges...", 500).then(() => addLog("[1.2s] 🔲 ID card detected: National ID Card (Egypt)", 700)).then(() => {
      setOcrState("parsing");
      return addLog("[1.8s] 🤖 Running Tesseract OCR engine on captured frame...", 600);
    }).then(() => addLog("[2.4s] 📖 Extracting: Full Name → \"أحمد محمد يوسف\" → Ahmed Mohamed Youssef", 600)).then(() => addLog("[3.0s] 📖 Extracting: National ID → 29901150100834", 600)).then(() => addLog("[3.5s] 📖 Extracting: Date of Birth → 1999-01-15", 500)).then(() => addLog("[4.0s] 📖 Extracting: Gender → Male", 500)).then(() => addLog("[4.5s] ✅ OCR extraction complete. All fields parsed with 98.7% confidence.", 500)).then(() => {
      setOcrState("done");
      const result = {
        name: "Ahmed Mohamed Youssef",
        nationalId: "29901150100834",
        dob: "1999-01-15",
        age: "27",
        gender: "male",
        phone: ""
      };
      setOcrResult(result);
      // Auto-fill the patient registration form
      setPatientValue("name", result.name);
      setPatientValue("age", result.age);
      setPatientValue("gender", result.gender);
      setPatientValue("nationalId", result.nationalId);
      toast.success(t("pages.receptionist.receptionistdashboard.idFieldsAutoPopulatedReviewAndSubmit"));
    });
  };

  // Tab colors helper
  const tabStyle = tabId => classNames("h-11 px-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === tabId ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25" : "bg-white border border-slate-100 text-slate-500 hover:border-brand-200 hover:text-slate-700");
  return <div className="space-y-10 pb-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("pages.receptionist.receptionistdashboard.operationalBrainActiveSession")}</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 uppercase">{t("pages.receptionist.receptionistdashboard.receptionHub")}</h1>
          <p className="mt-2 text-slate-500 font-medium">{t("pages.receptionist.receptionistdashboard.managePatientFlowBillingAndRegistrationWith")}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="rounded-2xl gap-2 shadow-sm" onClick={() => setIsInsuranceModalOpen(true)}>
            <Icon name="faFileInvoiceDollar" />{t("pages.receptionist.receptionistdashboard.insurancePos")}</Button>
          <Button variant="outline" size="lg" className="rounded-2xl gap-2 shadow-sm" onClick={() => window.location.href = ROUTES.appointments}>
            <Icon name="faCalendarAlt" />{t("pages.receptionist.receptionistdashboard.fullCalendar")}</Button>
          <Button variant="primary" size="lg" className="gap-2 rounded-2xl shadow-xl shadow-brand-500/20" onClick={() => window.location.href = `${ROUTES.appointments}?book=true`}>
            <Icon name="faPlus" />{t("pages.receptionist.receptionistdashboard.newBooking")}</Button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[{
        title: t("pages.receptionist.receptionistdashboard.todaySAppointments"),
        value: stats.total,
        icon: "faCalendarCheck",
        variant: "primary"
      }, {
        title: t("pages.receptionist.receptionistdashboard.confirmed"),
        value: stats.confirmed,
        icon: "faCheckCircle",
        variant: "success"
      }, {
        title: t("pages.receptionist.receptionistdashboard.pending"),
        value: stats.pending,
        icon: "faClock",
        variant: "warning"
      }, {
        title: t("pages.receptionist.receptionistdashboard.slotsAvailable"),
        value: stats.availableSlots,
        icon: "faDoorOpen",
        variant: "secondary"
      }].map((stat, i) => <Card key={i} variant="premium" className="relative overflow-hidden p-6 group transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className={classNames("h-12 w-12 rounded-xl flex items-center justify-center text-xl", stat.variant === "primary" ? "bg-brand-50 text-brand-600 border border-brand-100" : stat.variant === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : stat.variant === "warning" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-50 text-slate-600 border border-slate-100")}>
                <Icon name={stat.icon} />
              </div>
              <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                <div className={classNames("h-full transition-all duration-1000 ease-out", stat.variant === "primary" ? "bg-brand-500 w-3/4" : stat.variant === "success" ? "bg-emerald-500 w-1/2" : stat.variant === "warning" ? "bg-amber-500 w-1/4" : "bg-slate-500 w-full")}></div>
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.title}</p>
            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
          </Card>)}
      </div>

      {/* Tab Switcher: Schedule | Queue Board | Insurance */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => setActiveTab("schedule")} className={tabStyle("schedule")}>
          <Icon name="faTableList" />{t("pages.receptionist.receptionistdashboard.liveSchedule")}</button>
        <button onClick={() => setActiveTab("queue")} className={tabStyle("queue")}>
          <Icon name="faGripVertical" />{t("pages.receptionist.receptionistdashboard.patientFlowBoard")}</button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: Live Schedule (Original Table View) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "schedule" && <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2" title={t("pages.receptionist.receptionistdashboard.todaySLiveSchedule")} description="Monitoring all patient visits for the current day.">
            <div className="mb-6 flex items-center gap-4">
              <div className="relative flex-1">
                <Icon name="faSearch" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder={t("pages.receptionist.receptionistdashboard.quickSearchPatientOrDoctor")} className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 pl-11 pr-4 text-sm font-bold outline-none focus:border-brand-500 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Button variant="outline" className="h-12 rounded-2xl gap-2 shadow-sm" onClick={() => setIsNewPatientModalOpen(true)}>
                <Icon name="faUserPlus" />{t("pages.receptionist.receptionistdashboard.addPatient")}</Button>
            </div>

            <Table columns={[{
          header: t("pages.receptionist.receptionistdashboard.time"),
          render: row => <span className="font-black text-slate-900">{row.time}</span>
        }, {
          header: t("pages.receptionist.receptionistdashboard.patient"),
          render: row => <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-[10px] border border-brand-100">
                        {row.patientName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-none">{row.patientName}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-tighter">{row.serviceName}</p>
                      </div>
                    </div>
        }, {
          header: t("pages.receptionist.receptionistdashboard.doctor"),
          render: row => <span className="text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      {row.doctorName}
                    </span>
        }, {
          header: t("pages.receptionist.receptionistdashboard.payment"),
          render: row => <div className="flex flex-col">
                      <Badge tone={PAYMENT_STATUS_COLORS[row.paymentStatus || 'unpaid'] || "secondary"} className="uppercase font-black text-[9px] tracking-widest w-fit">
                        {row.paymentStatus || 'unpaid'}
                      </Badge>
                      <span className="text-[10px] text-slate-400 mt-1 font-bold">
                        ${row.paidAmount || 0} / ${row.price || 0}
                      </span>
                    </div>
        }, {
          header: t("pages.receptionist.receptionistdashboard.status"),
          render: row => <Badge tone={STATUS_COLORS[row.status] || "secondary"} className="uppercase font-black text-[9px] tracking-widest">
                      {row.status}
                    </Badge>
        }, {
          header: t("pages.receptionist.receptionistdashboard.action"),
          render: row => <div className="flex items-center gap-2">
                      {row.status === APPOINTMENT_STATUS.PENDING && <Button variant="success" size="sm" className="h-8 px-3 text-[10px] font-black uppercase tracking-widest" onClick={() => handleCheckIn(row.id)}>{t("pages.receptionist.receptionistdashboard.checkIn")}</Button>}
                      {row.paymentStatus !== "paid" && row.status !== APPOINTMENT_STATUS.CANCELLED && <Button variant="outline" size="sm" className="h-8 px-2.5 text-[10px] font-black uppercase tracking-widest text-brand-600 border-brand-100 hover:bg-brand-50 flex items-center gap-1" onClick={() => {
              setSelectedAppointmentForPayment(row);
              setIsPaymentModalOpen(true);
            }}>
                          <Icon name="faMoneyBillWave" />{t("pages.receptionist.receptionistdashboard.collect")}</Button>}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-500" onClick={() => {
              if (confirm(t("pages.receptionist.receptionistdashboard.cancelAppointment"))) cancelAppt(row.id);
            }}>
                        <Icon name="faXmark" />
                      </Button>
                    </div>
        }]} data={filteredAppointments} isLoading={isLoading} />
          </Card>

          {/* Sidebar Cards */}
          <div className="space-y-8">
            <Card title={t("pages.receptionist.receptionistdashboard.dailyCashDrawer")} description="Real-time financial collection tracking." className="border-emerald-100 bg-emerald-50/10">
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">{t("pages.receptionist.receptionistdashboard.collected")}</span>
                    <span className="text-base font-black text-emerald-600 block mt-0.5">${financialStats.collected.toFixed(2)}</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">{t("pages.receptionist.receptionistdashboard.pending2")}</span>
                    <span className="text-base font-black text-rose-600 block mt-0.5">${financialStats.pending.toFixed(2)}</span>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">{t("pages.receptionist.receptionistdashboard.totalExpectedValue")}</span>
                  <span className="font-black text-slate-800">${financialStats.expected.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            <Card title={t("pages.receptionist.receptionistdashboard.conflictWatch")} description="Automated collision detection." className="border-rose-100 bg-rose-50/20">
              <div className="mt-4 space-y-4">
                {stats.total > 15 ? <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                    <p className="text-xs font-black text-rose-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <Icon name="faCircleExclamation" />{t("pages.receptionist.receptionistdashboard.highLoadDetected")}</p>
                    <p className="text-xs font-medium text-rose-500">{t("pages.receptionist.receptionistdashboard.waitTimesMayExceed20MinutesToday")}</p>
                  </div> : <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <Icon name="faCheckCircle" />{t("pages.receptionist.receptionistdashboard.scheduleOptimal")}</p>
                    <p className="text-xs font-medium text-emerald-500">{t("pages.receptionist.receptionistdashboard.noMajorConflictsOrDelaysDetected")}</p>
                  </div>}
              </div>
            </Card>

            <Card title={t("pages.receptionist.receptionistdashboard.doctorStatus")} description="Real-time clinical availability.">
              <div className="mt-6 space-y-5">
                {doctorsData?.data.slice(0, 4).map((doc, i) => <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center font-bold text-slate-400 border border-slate-100 shadow-sm">
                        {doc.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-none">{doc.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">{doc.specialty || 'General'}</p>
                      </div>
                    </div>
                    <Badge tone={i % 3 === 0 ? 'success' : 'warning'} className="h-6 px-2 text-[9px] uppercase font-black">
                      {i % 3 === 0 ? 'Active' : 'Away'}
                    </Badge>
                  </div>)}
              </div>
            </Card>
          </div>
        </div>}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: Patient Flow Board (Drag-and-Drop Kanban) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "queue" && <div className="space-y-4">
          <p className="text-xs font-bold text-slate-500">
            <Icon name="faInfoCircle" className="mr-1" />{t("pages.receptionist.receptionistdashboard.dragPatientCardsBetweenColumnsToMove")}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {QUEUE_STAGES.map(stage => {
          const stagePatients = queuePatients.filter(p => p.stage === stage.id);
          const isOver = dragOverStage === stage.id;
          const colorMap = {
            amber: {
              bg: "bg-amber-50/50",
              border: "border-amber-200",
              text: "text-amber-600",
              iconBg: "bg-amber-100"
            },
            blue: {
              bg: "bg-blue-50/50",
              border: "border-blue-200",
              text: "text-blue-600",
              iconBg: "bg-blue-100"
            },
            brand: {
              bg: "bg-brand-50/50",
              border: "border-brand-200",
              text: "text-brand-600",
              iconBg: "bg-brand-100"
            },
            emerald: {
              bg: "bg-emerald-50/50",
              border: "border-emerald-200",
              text: "text-emerald-600",
              iconBg: "bg-emerald-100"
            }
          };
          const c = colorMap[stage.color];
          return <div key={stage.id} onDragOver={e => handleDragOver(e, stage.id)} onDragLeave={handleDragLeave} onDrop={() => handleDrop(stage.id)} className={classNames("rounded-3xl border-2 p-4 min-h-[280px] transition-all duration-300", isOver ? `${c.border} ${c.bg} scale-[1.02] shadow-xl` : "border-slate-100 bg-white/50")}>
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={classNames("h-8 w-8 rounded-xl flex items-center justify-center text-sm", c.iconBg, c.text)}>
                        <Icon name={stage.icon} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-600">{t(stage.labelKey, {
                    defaultValue: stage.label
                  })}</span>
                    </div>
                    <span className={classNames("h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black", c.iconBg, c.text)}>
                      {stagePatients.length}
                    </span>
                  </div>

                  {/* Patient Cards */}
                  <div className="space-y-3">
                    <AnimatePresence>
                      {stagePatients.map(patient => <MotionDiv key={patient.id} layout initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  scale: 0.95
                }} draggable onDragStart={() => handleDragStart(patient)} className={classNames("rounded-2xl border bg-white p-3.5 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg hover:-translate-y-0.5 group", draggedPatient?.id === patient.id ? "opacity-50 border-brand-300 shadow-lg" : "border-slate-100 shadow-sm")}>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xs border border-slate-100 shrink-0">
                              {patient.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate leading-none">{patient.name}</p>
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-1 truncate">{patient.service}</p>
                            </div>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{patient.time}</span>
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{patient.doctor}</span>
                          </div>
                          {/* Drag handle indicator */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icon name="faGripVertical" className="text-slate-300 text-[10px]" />
                          </div>
                        </MotionDiv>)}
                    </AnimatePresence>

                    {stagePatients.length === 0 && <div className={classNames("rounded-2xl border-2 border-dashed p-6 text-center transition-all", isOver ? `${c.border}` : "border-slate-200")}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {isOver ? "Drop here" : "Empty"}
                        </p>
                      </div>}
                  </div>
                </div>;
        })}
          </div>
        </div>}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: New Patient Registration (with OCR Scanner) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Modal isOpen={isNewPatientModalOpen} onClose={() => {
      setIsNewPatientModalOpen(false);
      setOcrState("idle");
      setOcrLogs([]);
      setOcrResult(null);
    }} title={t("pages.receptionist.receptionistdashboard.registerNewPatient")} size="md">
        <form onSubmit={patientSubmit(handlePatientCreate)} className="space-y-6 pt-4">
          {/* OCR Scanner Section */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="faIdCard" className="text-brand-500" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-600">{t("pages.receptionist.receptionistdashboard.smartIdScannerOcr")}</span>
              </div>
              {ocrState === "idle" && <Button type="button" onClick={handleStartOCR} variant="outline" className="h-9 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest gap-1.5">
                  <Icon name="faCamera" />{t("pages.receptionist.receptionistdashboard.scanIdCard")}</Button>}
              {ocrState === "done" && <Badge tone="success" className="uppercase font-black text-[9px] tracking-widest">
                  <Icon name="faCheckCircle" className="mr-1" />{t("pages.receptionist.receptionistdashboard.extracted")}</Badge>}
            </div>

            {/* OCR Terminal Logs */}
            {ocrLogs.length > 0 && <div className="bg-slate-900 text-emerald-400 font-mono text-[10px] p-3 rounded-xl max-h-[120px] overflow-y-auto border border-white/5 shadow-inner leading-relaxed">
                {ocrLogs.map((log, i) => <div key={i}>&gt; {log}</div>)}
              </div>}

            {ocrState !== "idle" && ocrState !== "done" && <div className="flex items-center gap-2 text-brand-600 font-black uppercase text-[10px] tracking-widest">
                <Icon name="faSpinner" className="animate-spin text-sm" />
                <span>{ocrState === "scanning" ? "Scanning document..." : "Parsing fields..."}</span>
              </div>}
          </div>

          {/* Patient Form Fields */}
          <div className="space-y-4">
            <Input label="Full Name" {...patientRegister("name", {
            required: t("pages.receptionist.receptionistdashboard.nameIsRequired")
          })} placeholder={t("pages.receptionist.receptionistdashboard.enterPatientName")} />
            <Input label="Phone Number" {...patientRegister("phone", {
            required: t("pages.receptionist.receptionistdashboard.phoneIsRequired")
          })} placeholder={t("pages.receptionist.receptionistdashboard.01xxxxxxxxx")} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Age" type="number" {...patientRegister("age")} />
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t("pages.receptionist.receptionistdashboard.gender")}</label>
                <select {...patientRegister("gender")} className="w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-brand-500 appearance-none shadow-sm transition-all">
                  <option value="male">{t("pages.receptionist.receptionistdashboard.male")}</option>
                  <option value="female">{t("pages.receptionist.receptionistdashboard.female")}</option>
                </select>
              </div>
            </div>
            <Input label="National ID (Optional)" {...patientRegister("nationalId")} placeholder={t("pages.receptionist.receptionistdashboard.eG29901150100834")} />
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t("pages.receptionist.receptionistdashboard.internalNotes")}</label>
              <textarea {...patientRegister("notes")} className="w-full h-24 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium outline-none focus:border-brand-500 shadow-sm transition-all" placeholder={t("pages.receptionist.receptionistdashboard.medicalHistoryAllergiesEtc")} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => {
            setIsNewPatientModalOpen(false);
            setOcrState("idle");
            setOcrLogs([]);
            setOcrResult(null);
          }}>{t("pages.receptionist.receptionistdashboard.discard")}</Button>
            <Button type="submit" className="px-8 shadow-halo">{t("pages.receptionist.receptionistdashboard.createPatientRecord")}</Button>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: Insurance POS & Copay Calculator */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Modal isOpen={isInsuranceModalOpen} onClose={resetInsuranceModal} title={t("pages.receptionist.receptionistdashboard.insurancePosCopayCalculator")} size="md">
        <div className="space-y-6 pt-4 text-slate-700">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-center">
            <Icon name="faShieldHalved" className="text-3xl text-brand-500 mb-2" />
            <h5 className="text-sm font-bold text-slate-800">{t("pages.receptionist.receptionistdashboard.instantInsuranceVerification")}</h5>
            <p className="text-xs text-slate-500 font-medium mt-1">{t("pages.receptionist.receptionistdashboard.verifyPatientCoverageAndCalculateCopaymentShare")}</p>
          </div>

          {/* Provider & Policy Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t("pages.receptionist.receptionistdashboard.insuranceProvider")}</label>
              <select value={selectedInsuranceProvider} onChange={e => {
              setSelectedInsuranceProvider(e.target.value);
              setInsuranceVerified(false);
              setCopayResult(null);
            }} className="w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-brand-500 appearance-none shadow-sm transition-all">
                <option value="">{t("pages.receptionist.receptionistdashboard.selectProvider")}</option>
                {INSURANCE_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.coverageRate * 100}{t("pages.receptionist.receptionistdashboard.coverage")}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t("pages.receptionist.receptionistdashboard.policyNumber")}</label>
              <input type="text" value={insurancePolicyId} onChange={e => {
              setInsurancePolicyId(e.target.value);
              setInsuranceVerified(false);
              setCopayResult(null);
            }} placeholder={t("pages.receptionist.receptionistdashboard.eGPol982741")} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold outline-none focus:border-brand-500 transition-all shadow-sm" />
            </div>
          </div>

          {/* Service Amount Input */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t("pages.receptionist.receptionistdashboard.serviceAmount")}</label>
            <input type="number" value={insuranceServiceAmount} onChange={e => {
            setInsuranceServiceAmount(e.target.value);
            setInsuranceVerified(false);
            setCopayResult(null);
          }} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-brand-500 transition-all shadow-sm" />
          </div>

          {/* Verify Button */}
          {!insuranceVerified && <Button onClick={handleVerifyInsurance} disabled={isVerifying} className="w-full h-12 rounded-2xl gap-2 shadow-md bg-brand-500 text-white">
              {isVerifying ? <><Icon name="faSpinner" className="animate-spin" />{t("pages.receptionist.receptionistdashboard.verifyingCoverage")}</> : <><Icon name="faShieldHalved" />{t("pages.receptionist.receptionistdashboard.verifyInsuranceCalculateCopay")}</>}
            </Button>}

          {/* Copay Result Card */}
          {copayResult && <MotionDiv initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-3 flex items-center gap-2 text-emerald-600 text-xs font-bold">
                <Icon name="faCircleCheck" />
                <span>{t("pages.receptionist.receptionistdashboard.policyVerifiedApprovalRef")}{copayResult.approvalRef}</span>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t("pages.receptionist.receptionistdashboard.coverageBreakdown")}</span>
                  <Badge tone="primary" className="uppercase text-[9px] tracking-widest">{copayResult.providerName}</Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("pages.receptionist.receptionistdashboard.serviceTotal")}</span>
                    <span className="font-bold text-slate-900">${copayResult.serviceAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("pages.receptionist.receptionistdashboard.coverageRate")}</span>
                    <span className="font-bold text-slate-900">{copayResult.coverageRate}%</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span className="font-medium">{t("pages.receptionist.receptionistdashboard.insuranceCovers")}</span>
                    <span className="font-bold">${copayResult.insurancePays}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-2 flex justify-between items-center">
                    <span className="font-black uppercase text-[10px] tracking-widest text-slate-600">{t("pages.receptionist.receptionistdashboard.patientCopayDue")}</span>
                    <span className="text-2xl font-black text-brand-600">${copayResult.patientCopay}</span>
                  </div>
                </div>
              </div>

              <Button onClick={resetInsuranceModal} className="w-full h-12 rounded-2xl gap-2 shadow-md bg-brand-500 text-white">
                <Icon name="faCheckCircle" />{t("pages.receptionist.receptionistdashboard.applyToPatientAccount")}</Button>
            </MotionDiv>}
        </div>
      </Modal>

      {/* Collect In-Clinic Payment Modal */}
      {selectedAppointmentForPayment && <PaymentModal isOpen={isPaymentModalOpen} onClose={() => {
      setIsPaymentModalOpen(false);
      setSelectedAppointmentForPayment(null);
    }} appointment={selectedAppointmentForPayment} />}
    </div>;
}
export default ReceptionistDashboard;
