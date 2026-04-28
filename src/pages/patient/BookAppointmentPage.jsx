import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { 
  useCreateAppointment 
} from "@/hooks/useAppointments";
import { useUsers } from "@/hooks/useUsers";
import { servicesApi } from "@/api/mockApi";
import { useAuthStore } from "@/store/authStore";
import { Card, Icon, Button, Badge } from "@/components";
import { ROLES, ROUTES, APPOINTMENT_STATUS } from "@/constants/appConstants";
import { classNames } from "@/utils";

const MotionDiv = motion.div;

function BookAppointmentPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const { data: doctorsData } = useUsers({ role: ROLES.DOCTOR });
  const { data: servicesData } = useQuery({ queryKey: ["services"], queryFn: () => servicesApi.list() });
  const { mutate: createAppt, isLoading: isBooking } = useCreateAppointment();

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      patientId: user.id,
      patientName: user.name,
    }
  });

  const selectedServiceId = watch("serviceId");
  const selectedDoctorId = watch("doctorId");
  const selectedDate = watch("date");
  const selectedTime = watch("time");

  const selectedService = useMemo(() => servicesData?.data.find(s => s.id === selectedServiceId), [servicesData, selectedServiceId]);
  const selectedDoctor = useMemo(() => doctorsData?.data.find(d => d.id === selectedDoctorId), [doctorsData, selectedDoctorId]);

  const onBookingSubmit = (data) => {
    const payload = {
      ...data,
      patientName: user.name,
      doctorName: selectedDoctor?.name,
      serviceName: selectedService?.name,
      price: selectedService?.price || 0,
      status: APPOINTMENT_STATUS.PENDING,
    };

    createAppt(payload, {
      onSuccess: () => {
        navigate(ROUTES.myAppointments);
      }
    });
  };

  const steps = [
    { id: 1, name: "Service", icon: "faStethoscope" },
    { id: 2, name: "Doctor", icon: "faUserMd" },
    { id: 3, name: "Schedule", icon: "faClock" },
    { id: 4, name: "Confirm", icon: "faCheckCircle" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="text-center space-y-4">
        <span className="hud-chip mx-auto">Booking Engine</span>
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Reserve Your Slot</h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          Follow the simple steps below to schedule your consultation with our world-class medical team.
        </p>
      </header>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 py-6">
        {steps.map((s) => (
          <div key={s.id} className="flex items-center gap-4">
            <div className={classNames(
              "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
              step === s.id ? "bg-brand-500 text-white shadow-halo scale-110" : 
              step > s.id ? "bg-emerald-500 text-white" : "bg-white border-2 border-slate-100 text-slate-300"
            )}>
              <Icon name={step > s.id ? "faCheck" : s.icon} className="text-lg" />
            </div>
            {s.id < 4 && (
              <div className={classNames(
                "h-1 w-12 rounded-full transition-all duration-500",
                step > s.id ? "bg-emerald-500" : "bg-slate-100"
              )} />
            )}
          </div>
        ))}
      </div>

      <Card variant="premium" className="overflow-hidden">
        <form onSubmit={handleSubmit(onBookingSubmit)} className="p-2">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <MotionDiv 
                key="step1" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicesData?.data.map((service) => (
                    <div 
                      key={service.id}
                      onClick={() => {
                        setValue("serviceId", service.id);
                        setStep(2);
                      }}
                      className={classNames(
                        "group cursor-pointer rounded-3xl border-2 p-6 transition-all duration-300 hover:shadow-xl",
                        selectedServiceId === service.id 
                          ? "border-brand-500 bg-brand-50/50 shadow-halo" 
                          : "border-slate-100 bg-slate-50/30 hover:border-brand-200"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-500 group-hover:scale-110 transition-transform">
                          <Icon name="faStethoscope" />
                        </div>
                        <span className="text-lg font-black text-slate-900">${service.price}</span>
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-slate-900">{service.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">{service.category} • {service.duration || "30"} mins</p>
                    </div>
                  ))}
                </div>
              </MotionDiv>
            )}

            {step === 2 && (
              <MotionDiv 
                key="step2" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctorsData?.data.map((doc) => (
                    <div 
                      key={doc.id}
                      onClick={() => {
                        setValue("doctorId", doc.id);
                        setStep(3);
                      }}
                      className={classNames(
                        "group cursor-pointer rounded-3xl border-2 p-6 transition-all duration-300 hover:shadow-xl",
                        selectedDoctorId === doc.id 
                          ? "border-brand-500 bg-brand-50/50 shadow-halo" 
                          : "border-slate-100 bg-slate-50/30 hover:border-brand-200"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-600 font-black text-xl border border-slate-100">
                          {doc.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{doc.name}</h3>
                          <p className="text-xs font-black uppercase tracking-widest text-brand-500">{doc.specialty}</p>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center gap-2">
                        <Badge tone="success" className="text-[10px] uppercase">Available Today</Badge>
                        <span className="text-[10px] font-bold text-slate-400">⭐ 4.9 (120+ reviews)</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" onClick={() => setStep(1)} className="mt-4">Back to Services</Button>
              </MotionDiv>
            )}

            {step === 3 && (
              <MotionDiv 
                key="step3" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Select Date</label>
                    <input 
                      type="date" 
                      {...register("date", { required: true })} 
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full h-16 rounded-3xl border-2 border-slate-100 bg-slate-50/50 px-6 text-sm font-bold outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Preferred Time</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setValue("time", t)}
                          className={classNames(
                            "h-12 rounded-xl text-xs font-black transition-all",
                            selectedTime === t ? "bg-brand-500 text-white shadow-lg" : "bg-white border border-slate-100 text-slate-600 hover:border-brand-300"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-6 border-t border-slate-100">
                  <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={() => selectedDate && selectedTime && setStep(4)} disabled={!selectedDate || !selectedTime} className="px-10 h-14">Review Summary</Button>
                </div>
              </MotionDiv>
            )}

            {step === 4 && (
              <MotionDiv 
                key="step4" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="space-y-8"
              >
                <div className="rounded-[40px] bg-slate-900 p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Booking Receipt</p>
                      <Badge tone="success" className="animate-pulse">Verified Available</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Patient</p>
                        <p className="text-xl font-bold">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Service</p>
                        <p className="text-xl font-bold text-brand-400">{selectedService?.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Consultant</p>
                        <p className="text-xl font-bold">{selectedDoctor?.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Schedule</p>
                        <p className="text-xl font-bold">{selectedDate} @ {selectedTime}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                      <p className="text-3xl font-black">${selectedService?.price}</p>
                      <Button type="submit" disabled={isBooking} className="h-14 px-12 bg-white text-slate-950 hover:bg-brand-50 shadow-xl shadow-white/10">
                        {isBooking ? "Processing..." : "Confirm Booking"}
                      </Button>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setStep(3)} className="text-slate-400">Edit Schedule</Button>
              </MotionDiv>
            )}
          </AnimatePresence>
        </form>
      </Card>
    </div>
  );
}

export default BookAppointmentPage;
