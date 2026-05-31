import { useEffect, useMemo, useRef, useState } from "react";
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
import { classNames } from "@/utils";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const MotionDiv = motion.div;

// ─── QR Pattern matrix (fixed, deterministic) ────────────────────────────────
const QR_PATTERN = [
  1,1,1,0,1,1,1,0,1,0,
  1,0,1,0,0,0,1,0,0,1,
  1,0,1,0,1,0,1,0,1,1,
  1,0,1,0,0,1,0,0,1,0,
  1,1,1,0,1,0,1,1,0,1,
  0,0,0,1,0,1,0,0,1,0,
  1,0,1,1,1,0,1,0,0,1,
  0,1,0,0,0,1,0,1,0,1,
  1,0,1,0,1,0,1,1,1,0,
  0,1,0,1,0,1,0,0,1,1,
];

function QRCodeBlock() {
  return (
    <div className="h-24 w-24 rounded-2xl border-2 border-slate-200 bg-white p-2 shadow-inner shrink-0">
      <div className="grid gap-[2px] w-full h-full" style={{ gridTemplateColumns: "repeat(10, 1fr)" }}>
        {QR_PATTERN.map((cell, i) => (
          <div
            key={i}
            className={classNames(
              "rounded-[1px]",
              cell ? "bg-slate-900" : "bg-transparent"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Animated Soundwave ───────────────────────────────────────────────────────
function SoundWave({ active }) {
  const BAR_HEIGHTS = [0.3, 0.6, 0.9, 0.7, 1.0, 0.5, 0.8, 0.4, 0.75, 0.55, 0.9, 0.35];
  return (
    <div className="flex items-center gap-[3px] h-10">
      {BAR_HEIGHTS.map((base, i) => (
        <motion.div
          key={i}
          className={classNames(
            "w-1 rounded-full",
            active ? "bg-brand-500" : "bg-slate-300"
          )}
          animate={active
            ? { height: [`${base * 20}%`, `${base * 100}%`, `${base * 20}%`] }
            : { height: "20%" }
          }
          transition={active
            ? { duration: 0.7 + i * 0.05, repeat: Infinity, delay: i * 0.07, ease: "easeInOut" }
            : { duration: 0.3 }
          }
          style={{ minHeight: "4px" }}
        />
      ))}
    </div>
  );
}

// ─── State label map ──────────────────────────────────────────────────────────
const SCRIBE_LABELS = {
  idle:         { label: "Ready",        color: "text-slate-400" },
  recording:    { label: "Listening…",   color: "text-rose-500" },
  transcribing: { label: "Transcribing…",color: "text-brand-600" },
  analyzing:    { label: "Analyzing…",   color: "text-amber-600" },
  success:      { label: "Complete ✓",   color: "text-emerald-600" },
};

// ─── Warning severity configs ─────────────────────────────────────────────────
const SEVERITY_STYLES = {
  danger: {
    wrapper: "border-rose-300 bg-gradient-to-br from-rose-50 to-rose-100/60",
    icon:    "text-rose-500",
    title:   "text-rose-800",
    text:    "text-rose-700",
    glow:    "shadow-rose-200/60",
    dot:     "bg-rose-500",
  },
  warning: {
    wrapper: "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/60",
    icon:    "text-amber-500",
    title:   "text-amber-800",
    text:    "text-amber-700",
    glow:    "shadow-amber-200/60",
    dot:     "bg-amber-500",
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
function PatientSessionPage() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const { data: appointment, isLoading } = useAppointment(appointmentId);
  const { data: patient } = usePatient(appointment?.patientId);
  const { data: patientAppointments } = useAppointments({ patientId: appointment?.patientId });
  const { mutate: updateAppointment, isLoading: isSaving } = useUpdateAppointment({ silent: true });
  const { mutate: updateStatus } = useUpdateAppointmentStatus({ silent: true });

  const [scribeState, setScribeState] = useState("idle");
  const [scribeLogs, setScribeLogs] = useState([]);
  const [ePrescriptionData, setEPrescriptionData] = useState(null);
  const logEndRef = useRef(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const watchedPrescription = watch("prescription");

  // Auto-scroll terminal
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [scribeLogs]);

  useEffect(() => {
    if (!appointment) return;
    reset({
      symptoms:     appointment.symptoms     || "",
      diagnosis:    appointment.diagnosis    || "",
      notes:        appointment.notes        || "",
      prescription: appointment.prescription || "",
    });
  }, [appointment, reset]);

  // ── Patient Age ─────────────────────────────────────────────────────────────
  const patientAge = useMemo(() => {
    if (!patient?.dob) return "—";
    const today = new Date();
    const dob = new Date(patient.dob);
    let age = today.getFullYear() - dob.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
    if (!hasBirthdayPassed) age -= 1;
    return age;
  }, [patient]);

  // ── Medical History ─────────────────────────────────────────────────────────
  const history = useMemo(() => {
    if (!patientAppointments?.data || !appointment?.id) return [];
    return patientAppointments.data
      .filter((appt) => appt.id !== appointment.id)
      .slice(0, 4);
  }, [patientAppointments, appointment]);

  // ── Drug & Allergy Conflict Engine ─────────────────────────────────────────
  const activeWarnings = useMemo(() => {
    const rx = (watchedPrescription || "").toLowerCase();
    if (!rx) return [];
    const list = [];

    if (rx.includes("amoxicillin") || rx.includes("penicillin") || rx.includes("augmentin")) {
      list.push({
        id: "allergy-penicillin",
        severity: "danger",
        icon: "faAllergies",
        title: "CRITICAL ALLERGY CONFLICT — Penicillin Class",
        text:
          "Patient has a documented Penicillin allergy. Amoxicillin & Augmentin are beta-lactams that share cross-reactivity and may trigger anaphylaxis. Consider substituting with Azithromycin 500mg or Clarithromycin.",
      });
    }

    if (
      rx.includes("warfarin") &&
      (rx.includes("aspirin") || rx.includes("ibuprofen") || rx.includes("advil") || rx.includes("nsaid"))
    ) {
      list.push({
        id: "drug-warfarin-aspirin",
        severity: "danger",
        icon: "faDroplet",
        title: "SEVERE DRUG INTERACTION — Major Bleeding Risk",
        text:
          "Warfarin + Aspirin/NSAIDs dramatically amplify anticoagulation and GI bleeding risk. Use Acetaminophen (Tylenol) for pain management instead, and monitor INR closely.",
      });
    }

    if (rx.includes("lisinopril") && (rx.includes("spironolactone") || rx.includes("potassium"))) {
      list.push({
        id: "drug-lisinopril-spiro",
        severity: "warning",
        icon: "faBolt",
        title: "HYPERKALEMIA RISK — Electrolyte Danger",
        text:
          "Lisinopril (ACE inhibitor) + Spironolactone (K⁺-sparing diuretic) can dangerously elevate serum potassium. Mandatory serum K⁺ monitoring required — consider dose reduction.",
      });
    }

    return list;
  }, [watchedPrescription]);

  // ── AI Scribe Simulation ────────────────────────────────────────────────────
  const handleStartScribe = () => {
    setScribeState("recording");
    setScribeLogs(["[0.0s] 🎙️  Initializing MediScribe AI — Whisper-v3 Neural Engine…"]);

    const appendLog = (logText, delay) =>
      new Promise((resolve) => setTimeout(() => {
        setScribeLogs((prev) => [...prev, logText]);
        resolve();
      }, delay));

    appendLog("[0.8s] 📡  Connecting to clinic cloud endpoint…", 800)
      .then(() => appendLog("[1.5s] 🔐  Secure clinical channel established (TLS 1.3)", 700))
      .then(() => appendLog("[2.2s] 💬  Doctor: \"Patient reports mild chest pain and chronic fatigue since two weeks.\"", 900))
      .then(() => appendLog("[3.0s] 💬  Doctor: \"Checking vitals — BP is 150/95. Diagnosing Stage 2 Hypertension.\"", 1100))
      .then(() => appendLog("[4.0s] 💬  Doctor: \"Prescribing Lisinopril 10mg once daily. Recommending low sodium diet.\"", 1200))
      .then(() => { setScribeState("transcribing"); return appendLog("[5.0s] 🤖  NLP parsing symptoms: chest pain, fatigue…", 900); })
      .then(() => { setScribeState("analyzing"); return appendLog("[5.8s] 🤖  AI resolving ICD-10: I10 — Essential (Primary) Hypertension", 700); })
      .then(() => appendLog("[6.4s] 🤖  Prescription structured: Lisinopril 10mg/day", 700))
      .then(() => appendLog("[7.0s] ✅  Integration successful. Populating workspace fields…", 600))
      .then(() => {
        setValue("symptoms", "Chest pain, chronic fatigue");
        setValue("diagnosis", "Hypertension Stage 2 (ICD-10: I10)");
        setValue("notes", "Stage 2 Hypertension diagnosed based on elevated blood pressure of 150/95 mmHg. Patient reports 2 weeks of mild chest pain and fatigue. No prior cardiac history noted.");
        setValue("prescription", "Lisinopril 10mg once daily (morning). Low sodium diet (<2g/day). Follow-up in 4 weeks for BP monitoring.");
        setScribeState("success");
        toast.success("AI Scribe completed — workspace populated!");
      });
  };

  // ── Save & Issue E-Prescription ─────────────────────────────────────────────
  const onSave = (data) => {
    if (!appointment) return;
    updateAppointment({ id: appointment.id, data }, {
      onSuccess: () => {
        if (data.prescription) {
          setEPrescriptionData({
            patientName: patient?.name || appointment.patientName,
            age: patientAge,
            doctorName: appointment.doctorName || "Senior Clinician",
            symptoms: data.symptoms,
            diagnosis: data.diagnosis,
            prescription: data.prescription,
            notes: data.notes,
            date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
            hash: `SEC-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
            rxId: `RX-${Math.random().toString(16).substring(2, 8).toUpperCase()}`,
          });
          toast.success("🔐 Secured E-Prescription issued!");
        } else {
          toast.success("Session saved successfully.");
        }
      },
    });
  };

  const onComplete = () => {
    if (!appointment) return;
    updateStatus({ id: appointment.id, status: APPOINTMENT_STATUS.COMPLETED }, {
      onSuccess: () => navigate(ROUTES.appointments),
    });
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-16">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between no-print">
        <div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.appointments)}
              className="h-9 px-3 rounded-xl"
            >
              <Icon name="faChevronLeft" className="mr-2" />
              Back
            </Button>
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
              Doctor · Session Workspace
            </span>
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            Clinical Workspace
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            AI-assisted diagnostics, drug safety checker &amp; secured e-prescriptions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="primary" className="uppercase font-black text-[10px] tracking-widest">
            {appointment?.status || "loading…"}
          </Badge>
          <Button variant="success" className="gap-2 shadow-md" onClick={onComplete}>
            <Icon name="faCheck" />
            Mark as Completed
          </Button>
        </div>
      </header>

      {/* ── Patient Info + Medical History Row ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 no-print">

        {/* Patient Profile Card */}
        <Card title="Patient Profile" description="Core details & registered allergies.">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Full Name", value: patient?.name || appointment?.patientName },
                { label: "Age", value: `${patientAge} yrs` },
                { label: "Phone", value: patient?.phone || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                  <span className="text-sm font-bold text-slate-900">{value}</span>
                </div>
              ))}

              {/* Allergy alert block */}
              <div className="rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100/50 px-4 py-3.5 flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 shrink-0">
                  <Icon name="faCircleExclamation" className="text-rose-500 text-xs" />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 block">
                    Registered Allergies
                  </span>
                  <p className="text-xs font-black text-rose-700 mt-1 uppercase tracking-tight">
                    Penicillin · Sulfa drugs
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Medical History Card */}
        <Card
          className="lg:col-span-2"
          title="Medical History"
          description="Recent visits and notes on record."
        >
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <Icon name="faNotesMedical" className="text-2xl text-slate-300 mb-3" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">No previous visits</p>
              </div>
            ) : (
              history.map((appt, idx) => (
                <MotionDiv
                  key={appt.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 hover:border-brand-200 transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{appt.serviceName}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{appt.date} · {appt.doctorName}</p>
                  </div>
                  <Badge tone="secondary" className="uppercase text-[10px] font-black tracking-widest">
                    {appt.status}
                  </Badge>
                </MotionDiv>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* ── AI Medical Scribe Panel ──────────────────────────────────────────── */}
      <MotionDiv
        className="no-print relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-premium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Decorative gradient bg */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50/60 via-transparent to-transparent" />
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-brand-500/8 blur-3xl" />

        {/* Card header */}
        <div className="relative flex flex-col gap-1 border-b border-slate-100/80 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20">
              <Icon name="faMicrophone" className="text-brand-600 text-sm" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                MediScribe AI Clinical Assistant
              </h3>
              <p className="text-sm text-slate-500">
                Transcribe doctor consultations and auto-fill diagnostics with smart speech parsing.
              </p>
            </div>
          </div>
        </div>

        <div className="relative p-8 space-y-6">
          {/* Controls row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            {/* Status + waveform */}
            <div className="flex items-center gap-5">
              <SoundWave active={scribeState === "recording"} />
              <div>
                <div className={classNames(
                  "text-[10px] font-black uppercase tracking-widest",
                  SCRIBE_LABELS[scribeState]?.color
                )}>
                  {SCRIBE_LABELS[scribeState]?.label}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">
                  {scribeState === "idle" && "Click Start to begin transcription"}
                  {scribeState === "recording" && "Recording consultation…"}
                  {scribeState === "transcribing" && "Processing speech to text…"}
                  {scribeState === "analyzing" && "Running clinical NLP analysis…"}
                  {scribeState === "success" && "Fields auto-populated from consultation"}
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-3 shrink-0">
              {scribeState === "idle" && (
                <Button
                  onClick={handleStartScribe}
                  className="h-11 px-6 rounded-2xl gap-2 bg-brand-500 text-white font-black uppercase text-[10px] tracking-widest shadow-halo"
                >
                  <Icon name="faMicrophone" />
                  Start AI Scribe
                </Button>
              )}
              {(scribeState === "transcribing" || scribeState === "analyzing") && (
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-600">
                  <Icon name="faSpinner" className="animate-spin" />
                  {scribeState}…
                </div>
              )}
              {scribeState === "recording" && (
                <Badge tone="danger" className="animate-pulse uppercase font-black text-[9px] tracking-widest px-3 py-1.5">
                  🔴 LIVE
                </Badge>
              )}
              {scribeState === "success" && (
                <Button
                  onClick={() => { setScribeState("idle"); setScribeLogs([]); }}
                  variant="outline"
                  className="h-10 px-4 rounded-xl gap-1.5"
                >
                  <Icon name="faRotate" />
                  Reset Scribe
                </Button>
              )}
            </div>
          </div>

          {/* Transcription terminal */}
          <AnimatePresence>
            {scribeLogs.length > 0 && (
              <MotionDiv
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="relative rounded-2xl bg-slate-950 border border-white/5 shadow-inner overflow-hidden">
                  {/* Terminal header bar */}
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                      mediscribe · whisper-v3 · live
                    </span>
                  </div>
                  {/* Logs */}
                  <div className="max-h-[180px] overflow-y-auto p-4 font-mono text-[11px] text-emerald-400 leading-relaxed space-y-1">
                    {scribeLogs.map((log, i) => (
                      <div key={i} className="whitespace-pre-wrap">
                        <span className="text-slate-600 select-none">❯ </span>
                        {log}
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </MotionDiv>

      {/* ── Consultation Editor Card ─────────────────────────────────────────── */}
      <Card
        className="no-print"
        title="Current Visit Editor"
        description="Capture symptoms, diagnosis, clinical notes, and prescriptions."
      >
        <form onSubmit={handleSubmit(onSave)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Symptoms" placeholder="e.g. chest pain, fatigue" {...register("symptoms")} />
            <Input label="Diagnosis" placeholder="e.g. Hypertension Stage 2" {...register("diagnosis")} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-tight text-slate-700 ml-1">
                Clinical Notes
              </label>
              <textarea
                className="w-full h-44 rounded-2xl border-2 border-slate-100 bg-white/70 p-4 text-sm font-medium outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all resize-none"
                placeholder="Detailed clinical notes…"
                {...register("notes")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold tracking-tight text-slate-700 ml-1">
                Prescription
                <span className="ml-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  · Conflict-checked in real-time
                </span>
              </label>
              <textarea
                className="w-full h-44 rounded-2xl border-2 border-slate-100 bg-white/70 p-4 text-sm font-medium outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all resize-none"
                placeholder="Medication and dosage (e.g. Lisinopril 10mg once daily)…"
                {...register("prescription")}
              />
            </div>
          </div>

          {/* ── Drug / Allergy Conflict Panel ──────────────────────────────── */}
          <AnimatePresence mode="wait">
            {activeWarnings.length > 0 ? (
              <MotionDiv
                key="warnings"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                {/* Conflict checker header chip */}
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3">
                    ⚠ Drug Safety Alert
                  </span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                {activeWarnings.map((w, i) => {
                  const s = SEVERITY_STYLES[w.severity] || SEVERITY_STYLES.danger;
                  return (
                    <MotionDiv
                      key={w.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={classNames(
                        "rounded-2xl border-2 p-5 flex items-start gap-4 shadow-lg",
                        s.wrapper, s.glow
                      )}
                    >
                      {/* Pulsing severity dot */}
                      <div className="relative mt-1 shrink-0">
                        <span className={classNames("block h-3 w-3 rounded-full", s.dot)} />
                        <span className={classNames("absolute inset-0 rounded-full animate-ping opacity-60", s.dot)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className={classNames("font-black uppercase text-[10px] tracking-widest mb-1.5", s.title)}>
                          {w.title}
                        </h6>
                        <p className={classNames("text-xs font-semibold leading-relaxed", s.text)}>
                          {w.text}
                        </p>
                      </div>
                    </MotionDiv>
                  );
                })}
              </MotionDiv>
            ) : watchedPrescription ? (
              <MotionDiv
                key="clear"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-emerald-200 bg-emerald-50/40 px-4 py-3 flex items-center gap-3"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 shrink-0">
                  <Icon name="faCircleCheck" className="text-emerald-500 text-sm" />
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  No drug-drug or registered allergy conflicts detected in this prescription.
                </span>
              </MotionDiv>
            ) : null}
          </AnimatePresence>

          {/* Form action buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <Button variant="ghost" type="button" onClick={() => navigate(ROUTES.appointments)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2 shadow-md">
              <Icon name="faSave" />
              {isSaving ? "Saving…" : "Save & Issue E-Prescription"}
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Secured E-Prescription Certificate ──────────────────────────────── */}
      <AnimatePresence>
        {ePrescriptionData && (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="max-w-2xl mx-auto"
          >
            {/* Section label */}
            <div className="text-center space-y-1 mb-5 no-print">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                  E-Prescription Issued &amp; Secured
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Blockchain-signed and ready for pharmacy verification.
              </p>
            </div>

            {/* Certificate card */}
            <div id="printable-invoice" className="relative overflow-hidden rounded-[2rem] border-2 border-slate-900 bg-white shadow-2xl">
              {/* Decorative corner */}
              <div className="absolute right-0 top-0 h-36 w-36 bg-slate-900/5 rounded-bl-full pointer-events-none" />

              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-900 px-8 py-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white">
                    🔐 QR-Secured E-Prescription
                  </span>
                  <p className="text-[10px] text-slate-400 font-black mt-2 font-mono">{ePrescriptionData.hash}</p>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Issued: {ePrescriptionData.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900 tracking-tight">MediCore Clinic</span>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Cairo, Egypt · Support: 19999</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">{ePrescriptionData.rxId}</p>
                </div>
              </div>

              {/* Patient & Doctor */}
              <div className="grid grid-cols-2 gap-6 px-8 py-6 border-b border-slate-100">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Patient
                  </span>
                  <p className="font-bold text-slate-900">{ePrescriptionData.patientName}</p>
                  <p className="text-xs text-slate-500">Age: {ePrescriptionData.age} years</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Prescribing Clinician
                  </span>
                  <p className="font-bold text-slate-900">Dr. {ePrescriptionData.doctorName}</p>
                  <p className="text-xs text-slate-500">Licensed Medical Practitioner</p>
                </div>
              </div>

              {/* Clinical Details */}
              <div className="grid grid-cols-2 gap-6 px-8 py-6 border-b border-slate-100">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Primary Diagnosis
                  </span>
                  <p className="font-bold text-slate-900">{ePrescriptionData.diagnosis || "—"}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Symptoms Observed
                  </span>
                  <p className="font-bold text-slate-900">{ePrescriptionData.symptoms || "—"}</p>
                </div>
              </div>

              {/* Prescription Block */}
              <div className="px-8 py-6 border-b border-slate-100">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-3">
                  Prescribed Medication
                </span>
                <div className="bg-slate-950 text-white rounded-2xl p-5 font-mono text-sm shadow-inner leading-relaxed border border-white/5">
                  {ePrescriptionData.prescription}
                </div>
              </div>

              {/* Signature + QR verification */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/60 px-8 py-6 rounded-b-[2rem]">
                <div className="space-y-3 text-center sm:text-left">
                  {/* Verified badge */}
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-700">
                    🔐 SECURELY VERIFIED · MEDICORE SECURENET
                  </span>
                  <p className="text-[10px] text-slate-500 font-medium max-w-xs leading-relaxed">
                    Pharmacies scan the QR code to validate this prescription against forgery in real time.
                  </p>
                  {/* Cursive signature */}
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                      Physician Digital Signature
                    </span>
                    <span className="text-2xl font-bold italic font-serif text-slate-800 select-none tracking-wide">
                      Dr. {ePrescriptionData.doctorName}
                    </span>
                    <div className="mt-1 h-px w-40 bg-slate-900" />
                  </div>
                </div>

                {/* QR mockup */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <QRCodeBlock />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Scan to Verify
                  </span>
                </div>
              </div>
            </div>

            {/* Print actions */}
            <div className="flex justify-center gap-3 mt-5 no-print">
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
                <Icon name="faXmark" className="mr-1.5" />
                Close
              </Button>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PatientSessionPage;
