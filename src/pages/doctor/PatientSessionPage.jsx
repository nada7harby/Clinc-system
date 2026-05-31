import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAppointment,
  useAppointments,
  useUpdateAppointment,
  useUpdateAppointmentStatus,
} from "@/hooks/useAppointments";
import { usePatient } from "@/hooks/usePatients";
import { APPOINTMENT_STATUS, ROUTES } from "@/constants/appConstants";
import { Button, Card, Badge, Icon, Input } from "@/components";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const MotionDiv = motion.div;

function PatientSessionPage() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const { data: appointment, isLoading } = useAppointment(appointmentId);
  const { data: patient } = usePatient(appointment?.patientId);
  const { data: patientAppointments } = useAppointments({
    patientId: appointment?.patientId,
  });
  const { mutate: updateAppointment, isLoading: isSaving } = useUpdateAppointment();
  const { mutate: updateStatus } = useUpdateAppointmentStatus();

  // AI Medical Scribe State
  const [scribeState, setScribeState] = useState("idle"); // idle, recording, transcribing, analyzing, success
  const [scribeLogs, setScribeLogs] = useState([]);
  
  // E-Prescription State
  const [ePrescriptionData, setEPrescriptionData] = useState(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm();

  // Watch prescription field for real-time conflict checking
  const watchedPrescription = watch("prescription");

  useEffect(() => {
    if (!appointment) return;
    reset({
      symptoms: appointment.symptoms || "",
      diagnosis: appointment.diagnosis || "",
      notes: appointment.notes || "",
      prescription: appointment.prescription || "",
    });
  }, [appointment, reset]);

  const patientAge = useMemo(() => {
    if (!patient?.dob) return "-";
    const today = new Date();
    const dob = new Date(patient.dob);
    let age = today.getFullYear() - dob.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
    if (!hasBirthdayPassed) age -= 1;
    return age;
  }, [patient]);

  const history = useMemo(() => {
    if (!patientAppointments?.data || !appointment?.id) return [];
    return patientAppointments.data
      .filter((appt) => appt.id !== appointment.id)
      .slice(0, 3);
  }, [patientAppointments, appointment]);

  // Dynamic Warning & Conflict Checker Logic
  const activeWarnings = useMemo(() => {
    const rx = (watchedPrescription || "").toLowerCase();
    const warningsList = [];

    if (!rx) return warningsList;

    // 1. Allergy Conflict Check (Patient has Penicillin allergy on record)
    if (rx.includes("amoxicillin") || rx.includes("penicillin") || rx.includes("augmentin")) {
      warningsList.push({
        id: "allergy-penicillin",
        type: "allergy",
        severity: "danger",
        title: "⚠️ CRITICAL ALLERGY CONFLICT",
        text: "Patient is highly allergic to Penicillin. Amoxicillin/Augmentin belongs to the beta-lactam class and may cause anaphylactic shock. Please substitute with Erythromycin or Azithromycin."
      });
    }

    // 2. Drug-Drug Conflict Check: Warfarin + Aspirin
    if (rx.includes("warfarin") && (rx.includes("aspirin") || rx.includes("ibuprofen") || rx.includes("advil") || rx.includes("nsaid"))) {
      warningsList.push({
        id: "drug-warfarin-aspirin",
        type: "drug",
        severity: "danger",
        title: "⚠️ DANGEROUS DRUG INTERACTION",
        text: "Co-administration of Warfarin and Aspirin/NSAIDs significantly increases bleeding risk (GI bleeding). Settle on alternative analgesics like Acetaminophen (Tylenol) if possible."
      });
    }

    // 3. Drug-Drug Conflict Check: Lisinopril + Spironolactone
    if (rx.includes("lisinopril") && (rx.includes("spironolactone") || rx.includes("potassium"))) {
      warningsList.push({
        id: "drug-lisinopril-spiro",
        type: "drug",
        severity: "warning",
        title: "⚠️ HYPERKALEMIA ELECTROLYTE DANGER",
        text: "Lisinopril (ACE inhibitor) and Spironolactone (potassium-sparing diuretic) can elevate serum potassium to dangerous levels. Close electrolyte monitoring is strictly required."
      });
    }

    return warningsList;
  }, [watchedPrescription]);

  // AI Medical Scribe speech-to-text simulation
  const handleStartScribe = () => {
    setScribeState("recording");
    setScribeLogs(["[0.0s] 🎙️ Initializing clinical speech transducer..."]);

    const appendLog = (logText, delayTime) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          setScribeLogs((prev) => [...prev, logText]);
          resolve();
        }, delayTime);
      });
    };

    appendLog("[0.8s] 📡 Connected to clinic cloud whisper-v3 model...", 800)
      .then(() => appendLog("[1.6s] 💬 Doctor: Patient reports mild chest pain and chronic fatigue since two weeks...", 1000))
      .then(() => appendLog("[2.8s] 💬 Doctor: Checking heart rate. BP is 150/95. I am diagnosing Stage 2 Hypertension...", 1200))
      .then(() => appendLog("[4.0s] 💬 Doctor: Prescribing Lisinopril 10mg once daily in the morning, and recommending low sodium diet...", 1200))
      .then(() => {
        setScribeState("transcribing");
        return appendLog("[5.0s] 🤖 AI Parsing symptoms: Chest pain, fatigue", 1000);
      })
      .then(() => {
        setScribeState("analyzing");
        return appendLog("[5.6s] 🤖 AI Parsing diagnosis: Hypertension Stage 2", 800);
      })
      .then(() => appendLog("[6.2s] 🤖 AI Parsing prescription: Lisinopril 10mg Daily", 800))
      .then(() => appendLog("[6.8s] ✅ Integration completed. Populating session workspace.", 600))
      .then(() => {
        setValue("symptoms", "Chest pain, fatigue");
        setValue("diagnosis", "Hypertension Stage 2");
        setValue("notes", "Stage 2 Hypertension diagnosed based on elevated blood pressure of 150/95. Patient reports mild chest pain and fatigue for 2 weeks.");
        setValue("prescription", "Lisinopril 10mg once daily in the morning. Low sodium diet recommended.");
        setScribeState("success");
        toast.success("AI scribe integrated successfully!");
      });
  };

  const onSave = (data) => {
    if (!appointment) return;
    updateAppointment({ id: appointment.id, data }, {
      onSuccess: () => {
        // Automatically generate secured e-prescription after saving
        if (data.prescription) {
          setEPrescriptionData({
            patientName: patient?.name || appointment.patientName,
            age: patientAge,
            doctorName: appointment.doctorName || "Lead Practitioner",
            symptoms: data.symptoms,
            diagnosis: data.diagnosis,
            prescription: data.prescription,
            notes: data.notes,
            date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
            hash: `SEC-SHA256-${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
          });
          toast.success("Secured E-Prescription issued!");
        }
      }
    });
  };

  const onComplete = () => {
    if (!appointment) return;
    updateStatus({ id: appointment.id, status: APPOINTMENT_STATUS.COMPLETED }, {
      onSuccess: () => {
        navigate(ROUTES.appointments);
      }
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between no-print">
        <div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.appointments)}
              className="h-9 px-3"
            >
              <Icon name="faChevronLeft" className="mr-2" />
              Back
            </Button>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Patient Session
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
            Session Workspace
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="primary" className="uppercase font-black text-[10px] tracking-widest">
            {appointment?.status || "loading"}
          </Badge>
          <Button variant="success" className="gap-2 shadow-md" onClick={onComplete}>
            <Icon name="faCheck" />
            Mark as Completed
          </Button>
        </div>
      </header>

      {/* Patient Profile, Allergies, and Medical History Card Row */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 no-print">
        {/* Patient Profile Card (Includes Allergy Alert) */}
        <Card title="Patient Info" description="Core details & registered allergies.">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-2xl bg-slate-100 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Name</span>
                <span className="text-sm font-bold text-slate-900">{patient?.name || appointment?.patientName}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Age</span>
                <span className="text-sm font-bold text-slate-900">{patientAge}</span>
              </div>
              
              {/* Allergy Warning Box inside Patient info card */}
              <div className="rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3.5 flex items-start gap-2.5">
                <Icon name="faCircleExclamation" className="text-rose-500 text-sm mt-0.5" />
                <div className="leading-none">
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 block">Registered Allergies</span>
                  <p className="text-xs font-black text-rose-700 mt-1 uppercase tracking-tighter">Penicillin, Sulfa drugs</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Phone</span>
                <span className="text-sm font-bold text-slate-900">{patient?.phone || "-"}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Medical History */}
        <Card
          className="lg:col-span-2"
          title="Medical History"
          description="Recent visits and notes on record."
        >
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-400 bg-white/50">
                <Icon name="faNotesMedical" className="text-2xl mb-2" />
                <p className="text-xs font-black uppercase tracking-widest">No previous visits</p>
              </div>
            ) : (
              history.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{appt.serviceName}</p>
                    <p className="text-xs font-semibold text-slate-500">{appt.date} • {appt.doctorName}</p>
                  </div>
                  <Badge tone="secondary" className="uppercase text-[10px] font-black tracking-widest">
                    {appt.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Dynamic E-Prescription Card layout - Appears when prescription has been successfully issued */}
      {ePrescriptionData && (
        <MotionDiv
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto py-4"
        >
          <div className="text-center space-y-2 mb-4 no-print">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">🔐 E-Prescription Issued</h3>
            <p className="text-xs text-slate-500 font-medium">Secured with blockchain hash. Hand it over to the pharmacy.</p>
          </div>

          <div id="printable-invoice" className="relative overflow-hidden rounded-[36px] border-2 border-slate-900 bg-white p-8 shadow-2xl">
            <div className="absolute right-0 top-0 h-32 w-32 bg-slate-900/5 rounded-bl-full pointer-events-none" />
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white">QR-Secured E-Prescription</span>
                <p className="text-xs text-slate-400 font-black mt-2 font-mono">{ePrescriptionData.hash}</p>
                <p className="text-xs text-slate-500 font-bold">Date: {ePrescriptionData.date}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-slate-900">MediCore Clinic</span>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Cairo, Egypt • Support Line: 19999</p>
              </div>
            </div>

            {/* Content Details */}
            <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-100 text-slate-700">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Patient Client</span>
                <p className="font-bold text-slate-900 mt-1">{ePrescriptionData.patientName} (Age: {ePrescriptionData.age})</p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prescribing Clinician</span>
                <p className="font-bold text-slate-900 mt-1">Dr. {ePrescriptionData.doctorName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-100 text-slate-700">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Diagnosis</span>
                <p className="font-bold text-slate-900 mt-1">{ePrescriptionData.diagnosis || "-"}</p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Symptoms Observed</span>
                <p className="font-bold text-slate-900 mt-1">{ePrescriptionData.symptoms || "-"}</p>
              </div>
            </div>

            {/* Prescribed Drugs Section */}
            <div className="py-6 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Prescribed Medication</span>
              <div className="bg-slate-950 text-white rounded-2xl p-5 font-mono text-sm shadow-inner leading-relaxed border border-slate-900">
                {ePrescriptionData.prescription}
              </div>
            </div>

            {/* Verification & Signature Layout */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 mt-2">
              <div className="space-y-2 text-center sm:text-left">
                <span className="rounded-full bg-emerald-500/10 border border-emerald-400/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 inline-block">
                  🔐 Security Seal Verified
                </span>
                <p className="text-xs text-slate-500 font-medium">Pharmacies can scan this QR ticket to check validity against forgery.</p>
                
                {/* Simulated Cursive Doctor Signature */}
                <div className="pt-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Physician digital signature</span>
                  <span className="text-xl font-bold font-serif text-slate-800 italic block mt-1 select-none">Dr. {ePrescriptionData.doctorName}</span>
                </div>
              </div>

              {/* Secure QR Mockup */}
              <div className="h-20 w-20 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-sm shrink-0">
                <div className="grid grid-cols-5 gap-0.5 w-full h-full opacity-80">
                  {[...Array(25)].map((_, i) => (
                    <div key={i} className={classNames(
                      "rounded-[2px]",
                      (i % 2 === 0 && i % 3 !== 0) || i === 0 || i === 4 || i === 20 || i === 24 ? "bg-slate-900" : "bg-transparent"
                    )} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Print Buttons */}
          <div className="flex justify-center gap-3 mt-4 no-print">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="rounded-2xl gap-2 shadow-sm"
            >
              <Icon name="faPrint" />
              Print E-Prescription
            </Button>
            <Button
              variant="ghost"
              onClick={() => setEPrescriptionData(null)}
              className="text-slate-400"
            >
              Close Receipt
            </Button>
          </div>
        </MotionDiv>
      )}

      {/* AI Medical Scribe Console Integration Card */}
      <Card
        className="no-print"
        title="🎙️ MediScribe AI Clinical Assistant"
        description="Transcribe doctor consultations and auto-fill diagnostics with smart speech parsing."
      >
        <div className="mt-4 space-y-4 text-slate-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <h5 className="text-sm font-bold">Vocal Dictation Transcribing</h5>
              <p className="text-xs text-slate-500 font-medium">
                Click recording to capture conversations. The AI scribe will automatically structure symptoms, diagnostics, and prescriptions.
              </p>
            </div>
            
            {scribeState === "idle" && (
              <Button
                onClick={handleStartScribe}
                className="h-12 px-8 rounded-2xl gap-2 bg-brand-500 text-white shadow-halo font-black uppercase text-[10px] tracking-widest shrink-0"
              >
                <Icon name="faMicrophone" className="text-sm" />
                Start AI Scribe
              </Button>
            )}

            {scribeState === "recording" && (
              <div className="flex items-center gap-4 shrink-0">
                {/* Active audio waveform bars pulsing */}
                <div className="flex items-end gap-1.5 h-10 w-24">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ["20%", "90%", "20%"] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
                      className="w-1.5 bg-brand-500 rounded-full"
                    />
                  ))}
                </div>
                <Badge tone="danger" className="animate-pulse uppercase font-black text-[9px] tracking-widest">
                  🎙️ LISTENING
                </Badge>
              </div>
            )}

            {scribeState !== "idle" && scribeState !== "recording" && scribeState !== "success" && (
              <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-brand-600 shrink-0">
                <Icon name="faSpinner" className="animate-spin text-sm" />
                <span>{scribeState}</span>
              </div>
            )}

            {scribeState === "success" && (
              <Button
                onClick={() => {
                  setScribeState("idle");
                  setScribeLogs([]);
                }}
                variant="outline"
                className="h-10 px-4 rounded-xl text-slate-400 gap-1.5 shrink-0"
              >
                <Icon name="faRotate" />
                Reset Scribe
              </Button>
            )}
          </div>

          {/* Scribe Log terminal */}
          {scribeLogs.length > 0 && (
            <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-4 rounded-2xl max-h-[160px] overflow-y-auto border border-white/5 shadow-inner leading-relaxed">
              {scribeLogs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap">&gt; {log}</div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Main Consultation Editor Card */}
      <Card
        className="no-print"
        title="Current Visit Editor"
        description="Capture symptoms, diagnosis, and notes."
      >
        <form onSubmit={handleSubmit(onSave)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Symptoms" placeholder="e.g. chest pain, fatigue" {...register("symptoms")} />
            <Input label="Diagnosis" placeholder="e.g. Hypertension" {...register("diagnosis")} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-tight text-slate-700 ml-1">Notes</label>
              <textarea
                className="w-full h-44 rounded-2xl border-2 border-slate-100 bg-white/70 p-4 text-sm font-medium outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                placeholder="Clinical notes..."
                {...register("notes")}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-tight text-slate-700 ml-1">Prescription (optional)</label>
              <textarea
                className="w-full h-44 rounded-2xl border-2 border-slate-100 bg-white/70 p-4 text-sm font-medium outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                placeholder="Medication and dosage (e.g. Lisinopril 10mg once daily)..."
                {...register("prescription")}
              />
            </div>
          </div>

          {/* Dynamic Drug Warnings & Allergy Checker Alert Panel */}
          <AnimatePresence>
            {activeWarnings.length > 0 ? (
              <MotionDiv
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {activeWarnings.map(w => (
                  <div
                    key={w.id}
                    className={classNames(
                      "rounded-2xl border-2 p-4 flex items-start gap-3 shadow-md",
                      w.severity === "danger"
                        ? "border-rose-200 bg-rose-50/50 text-rose-700"
                        : "border-amber-200 bg-amber-50/50 text-amber-700"
                    )}
                  >
                    <Icon name="faTriangleExclamation" className="text-xl shrink-0 mt-0.5" />
                    <div>
                      <h6 className="font-black uppercase text-[10px] tracking-widest">{w.title}</h6>
                      <p className="text-xs font-bold leading-relaxed mt-1">{w.text}</p>
                    </div>
                  </div>
                ))}
              </MotionDiv>
            ) : watchedPrescription && (
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-3 flex items-center gap-2 text-emerald-600 text-xs font-bold"
              >
                <Icon name="faCircleCheck" />
                <span>No drug-drug or registered allergy conflicts detected in this prescription.</span>
              </MotionDiv>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <Button variant="ghost" type="button" onClick={() => navigate(ROUTES.appointments)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2 shadow-md">
              <Icon name="faSave" />
              {isSaving ? "Saving..." : "Save & Issue E-Prescription"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default PatientSessionPage;
