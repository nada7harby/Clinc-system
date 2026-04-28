import { useEffect, useMemo } from "react";
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

function PatientSessionPage() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const { data: appointment, isLoading } = useAppointment(appointmentId);
  const { data: patient } = usePatient(appointment?.patientId);
  const { data: patientAppointments } = useAppointments({
    patientId: appointment?.patientId,
  });
  const { mutate: updateAppointment } = useUpdateAppointment();
  const { mutate: updateStatus } = useUpdateAppointmentStatus();

  const { register, handleSubmit, reset } = useForm();

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

  const onSave = (data) => {
    if (!appointment) return;
    updateAppointment({ id: appointment.id, data });
  };

  const onComplete = () => {
    if (!appointment) return;
    updateStatus({ id: appointment.id, status: APPOINTMENT_STATUS.COMPLETED });
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
          <Button variant="success" className="gap-2" onClick={onComplete}>
            <Icon name="faCheck" />
            Mark as Completed
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card title="Patient Info" description="Core details for this visit.">
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
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Phone</span>
                <span className="text-sm font-bold text-slate-900">{patient?.phone || "-"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Visit</span>
                <span className="text-sm font-bold text-slate-900">
                  {appointment?.date} • {appointment?.time}
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card
          className="lg:col-span-2"
          title="Medical History"
          description="Recent visits and notes on record."
        >
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-400">
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

      <Card title="Current Visit" description="Capture symptoms, diagnosis, and notes.">
        <form onSubmit={handleSubmit(onSave)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Symptoms" placeholder="e.g. chest pain, fatigue" {...register("symptoms")} />
            <Input label="Diagnosis" placeholder="e.g. Hypertension" {...register("diagnosis")} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-tight text-slate-700 ml-1">Notes</label>
              <textarea
                className="w-full h-32 rounded-2xl border-2 border-slate-100 bg-white/70 p-4 text-sm font-medium outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                placeholder="Clinical notes..."
                {...register("notes")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-tight text-slate-700 ml-1">Prescription (optional)</label>
              <textarea
                className="w-full h-32 rounded-2xl border-2 border-slate-100 bg-white/70 p-4 text-sm font-medium outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                placeholder="Medication and dosage..."
                {...register("prescription")}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <Button variant="ghost" type="button" onClick={() => navigate(ROUTES.appointments)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Icon name="faSave" />
              Save
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default PatientSessionPage;
