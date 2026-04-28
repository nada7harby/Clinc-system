import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppointments } from "@/hooks/useAppointments";
import { useAuthStore } from "@/store/authStore";
import { Card, Icon, Button, Badge } from "@/components";
import { ROUTES, APPOINTMENT_STATUS } from "@/constants/appConstants";
import { motion } from "framer-motion";

function PatientDashboard() {
  const { user } = useAuthStore();
  const { data: appointmentsData, isLoading } = useAppointments({ patientId: user.id });

  const stats = useMemo(() => {
    if (!appointmentsData?.data) return { upcoming: [], next: null, totalVisits: 0 };
    
    const all = appointmentsData.data;
    const completed = all.filter(a => a.status === APPOINTMENT_STATUS.COMPLETED);
    const upcoming = all
      .filter(a => a.status === APPOINTMENT_STATUS.PENDING || a.status === APPOINTMENT_STATUS.CONFIRMED)
      .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    return {
      upcoming: upcoming.slice(1, 4),
      next: upcoming[0] || null,
      totalVisits: completed.length
    };
  }, [appointmentsData]);

  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="hud-chip">Welcome back, {user?.name?.split(' ')[0]}</span>
          <h1 className="mt-4 text-5xl font-black text-slate-900 uppercase tracking-tight">
            Patient Dashboard
          </h1>
          <p className="mt-2 text-lg font-medium text-slate-500">
            Manage your health journey and upcoming consultations.
          </p>
        </div>
        <Link to={ROUTES.bookAppointment}>
          <Button className="h-16 px-10 rounded-[24px] shadow-halo gap-3 text-lg">
            <Icon name="faPlusCircle" />
            Book Appointment
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Next Appointment - The most important thing */}
        <Card className="lg:col-span-1 bg-slate-950 text-white border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl group-hover:bg-brand-500/30 transition-all duration-700" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                <Icon name="faCalendarCheck" className="text-2xl text-brand-400" />
              </div>
              <Badge tone="success" className="bg-emerald-500/20 border-none text-emerald-400 font-black uppercase tracking-widest text-[10px]">
                Next Priority
              </Badge>
            </div>

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-white/10 rounded-lg w-3/4" />
                <div className="h-4 bg-white/5 rounded-lg w-1/2" />
              </div>
            ) : stats.next ? (
              <>
                <h3 className="text-3xl font-black leading-tight">
                  {new Date(stats.next.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <p className="text-xl font-bold text-brand-400 mt-2">at {stats.next.time}</p>
                
                <div className="mt-10 p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center font-bold text-xs">
                      {stats.next.doctorName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Consultant</p>
                      <p className="text-sm font-bold">{stats.next.doctorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                    <Icon name="faStethoscope" className="text-brand-400 text-xs" />
                    <p className="text-sm font-medium text-white/70">{stats.next.serviceName}</p>
                  </div>
                </div>

                <div className="mt-10 flex gap-3">
                   <Button variant="accent" className="flex-1 h-12 rounded-xl">View Details</Button>
                   <Button variant="ghost" className="h-12 w-12 rounded-xl border border-white/10 text-white hover:bg-white/5 p-0">
                      <Icon name="faEllipsisV" />
                   </Button>
                </div>
              </>
            ) : (
              <div className="py-10 text-center">
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No upcoming visits</p>
                <Link to={ROUTES.bookAppointment} className="mt-4 block">
                  <Button variant="accent" size="sm">Schedule Now</Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Stats & Records */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
           <Card className="bg-brand-50 border-brand-100 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em] mb-4">Clinical Footprint</p>
                <h3 className="text-5xl font-black text-slate-900">{stats.totalVisits}</h3>
                <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Previous Consultations</p>
              </div>
              <Link to={ROUTES.medicalHistory} className="mt-8">
                <Button variant="outline" className="w-full border-brand-200 text-brand-600 bg-white hover:bg-brand-50 rounded-2xl">
                   View Medical Records
                </Button>
              </Link>
           </Card>

           <Card title="Quick Vitals" description="Latest metrics from your records.">
              <div className="grid grid-cols-2 gap-3 mt-6">
                 {[
                   { label: "BP", val: "120/80", tone: "rose" },
                   { label: "Weight", val: "72 kg", tone: "brand" },
                   { label: "Glucose", val: "95", tone: "emerald" },
                   { label: "HR", val: "72 bpm", tone: "amber" },
                 ].map((v, i) => (
                   <div key={i} className={`p-4 rounded-2xl border bg-${v.tone}-50 border-${v.tone}-100`}>
                      <p className={`text-[9px] font-black uppercase tracking-widest text-${v.tone}-500 mb-1`}>{v.label}</p>
                      <p className="text-lg font-black text-slate-900">{v.val}</p>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Upcoming Appointments List */}
        <Card className="lg:col-span-2" title="Upcoming Schedule" description="Your confirmed and pending visits.">
          <div className="mt-8 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-20 bg-slate-50 rounded-3xl animate-pulse" />)}
              </div>
            ) : stats.upcoming.length > 0 ? (
              stats.upcoming.map((appt) => (
                <div key={appt.id} className="group flex items-center justify-between p-5 rounded-[28px] bg-slate-50 border border-slate-100 hover:border-brand-200 hover:bg-white transition-all">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center leading-none">
                      <span className="text-[10px] font-black text-slate-400 uppercase">{appt.date.split('-')[1]}</span>
                      <span className="text-lg font-black text-slate-900">{appt.date.split('-')[2]}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{appt.serviceName}</h4>
                      <p className="text-xs font-medium text-slate-500">Dr. {appt.doctorName} • {appt.time}</p>
                    </div>
                  </div>
                  <Badge tone={appt.status === APPOINTMENT_STATUS.CONFIRMED ? 'success' : 'warning'} className="uppercase font-black text-[9px]">
                    {appt.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-center py-10 text-slate-400 font-medium">No other upcoming appointments.</p>
            )}
          </div>
        </Card>

        {/* Notifications */}
        <Card title="Notifications" description="Updates regarding your care.">
          <div className="mt-8 space-y-4">
             {[
               { icon: "faFlask", title: "Lab Results", detail: "Blood test reports are ready.", time: "2h ago" },
               { icon: "faPrescription", title: "Prescription", detail: "Dr. Sarah added new meds.", time: "Yesterday" }
             ].map((n, i) => (
               <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                    <Icon name={n.icon} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center w-full">
                       <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                       <span className="text-[9px] font-bold text-slate-400 uppercase">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{n.detail}</p>
                  </div>
               </div>
             ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PatientDashboard;
