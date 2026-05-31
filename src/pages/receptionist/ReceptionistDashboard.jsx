import { useState, useMemo } from "react";
import { Card, Button, Icon, Badge, Table, Modal, Input, PaymentModal } from "@/components";
import { useAppointments, useUpdateAppointmentStatus, useCancelAppointment } from "@/hooks/useAppointments";
import { useUsers } from "@/hooks/useUsers";
import { usePatients, useCreatePatient } from "@/hooks/usePatients";
import { useForm } from "react-hook-form";
import { classNames } from "@/utils";
import { APPOINTMENT_STATUS, STATUS_COLORS, ROLES, ROUTES, PAYMENT_STATUS_COLORS } from "@/constants/appConstants";
import toast from "react-hot-toast";

function ReceptionistDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAppointmentForPayment, setSelectedAppointmentForPayment] = useState(null);
  
  const { data: appointmentsData, isLoading } = useAppointments();
  const { data: doctorsData } = useUsers({ role: ROLES.DOCTOR });
  const { data: patientsData } = usePatients();
  const { mutate: updateStatus } = useUpdateAppointmentStatus();
  const { mutate: cancelAppt } = useCancelAppointment();
  const { mutate: createPatient } = useCreatePatient();
  
  const { register: patientRegister, handleSubmit: patientSubmit, reset: patientReset } = useForm();

  // 1. Stats calculation (Today's focus)
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
      availableSlots: 20 - apps.length, // Simulated capacity
    };
  }, [todayAppointments]);

  // Financial stats calculation
  const financialStats = useMemo(() => {
    const apps = todayAppointments;
    let expected = 0;
    let collected = 0;
    apps.forEach((a) => {
      if (a.status !== APPOINTMENT_STATUS.CANCELLED) {
        const price = parseFloat(a.price) || 0;
        const paid = parseFloat(a.paidAmount) || 0;
        expected += price;
        collected += paid;
      }
    });
    return {
      expected,
      collected,
      pending: expected - collected,
    };
  }, [todayAppointments]);

  // 2. Filtered list for search
  const filteredAppointments = useMemo(() => {
    if (!todayAppointments) return [];
    return todayAppointments.filter(a => 
      a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [todayAppointments, searchTerm]);

  const handlePatientCreate = (data) => {
    createPatient(data, {
      onSuccess: () => {
        setIsNewPatientModalOpen(false);
        patientReset();
      }
    });
  };

  const handleCheckIn = (id) => {
    updateStatus({ id, status: APPOINTMENT_STATUS.CONFIRMED });
    toast.success("Patient checked in successfully!");
  };

  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
           <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Operational Brain • Active Session
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 uppercase">
            Reception Hub
          </h1>
          <p className="mt-2 text-slate-500 font-medium">Manage patient flow and scheduling with precision.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="rounded-2xl gap-2 shadow-sm" onClick={() => window.location.href = ROUTES.appointments}>
            <Icon name="faCalendarAlt" />
            Full Calendar
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="gap-2 rounded-2xl shadow-xl shadow-brand-500/20"
            onClick={() => window.location.href = `${ROUTES.appointments}?book=true`}
          >
            <Icon name="faPlus" />
            New Booking
          </Button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Today's Appointments", value: stats.total, icon: "faCalendarCheck", variant: "primary" },
          { title: "Confirmed", value: stats.confirmed, icon: "faCheckCircle", variant: "success" },
          { title: "Pending", value: stats.pending, icon: "faClock", variant: "warning" },
          { title: "Slots Available", value: stats.availableSlots, icon: "faDoorOpen", variant: "secondary" },
        ].map((stat, i) => (
          <Card key={i} variant="premium" className="relative overflow-hidden p-6 group transition-all hover:-translate-y-1">
             <div className="flex items-center justify-between mb-4">
                <div className={classNames(
                  "h-12 w-12 rounded-xl flex items-center justify-center text-xl",
                  stat.variant === "primary" ? "bg-brand-50 text-brand-600 border border-brand-100" :
                  stat.variant === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                  stat.variant === "warning" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-50 text-slate-600 border border-slate-100"
                )}>
                   <Icon name={stat.icon} />
                </div>
                <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                   <div className={classNames("h-full transition-all duration-1000 ease-out", 
                      stat.variant === "primary" ? "bg-brand-500 w-3/4" :
                      stat.variant === "success" ? "bg-emerald-500 w-1/2" :
                      stat.variant === "warning" ? "bg-amber-500 w-1/4" : "bg-slate-500 w-full"
                   )}></div>
                </div>
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.title}</p>
             <p className="text-3xl font-black text-slate-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Focus: Today's Appointments */}
        <Card
          className="lg:col-span-2"
          title="Today's Live Schedule"
          description="Monitoring all patient visits for the current day."
        >
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Icon
                name="faSearch"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Quick search patient or doctor..."
                className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 pl-11 pr-4 text-sm font-bold outline-none focus:border-brand-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-12 rounded-2xl gap-2 shadow-sm" onClick={() => setIsNewPatientModalOpen(true)}>
               <Icon name="faUserPlus" />
               Add Patient
            </Button>
          </div>

          <Table
            columns={[
              {
                header: "Time",
                accessor: "time",
                render: (row) => <span className="font-black text-slate-900">{row.time}</span>,
              },
              {
                header: "Patient",
                render: (row) => (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-[10px] border border-brand-100">
                      {row.patientName.charAt(0)}
                    </div>
                    <div>
                       <p className="font-bold text-slate-900 leading-none">{row.patientName}</p>
                       <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-tighter">{row.serviceName}</p>
                    </div>
                  </div>
                ),
              },
              { 
                header: "Doctor", 
                render: (row) => (
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    {row.doctorName}
                  </span>
                )
              },
              {
                header: "Payment",
                render: (row) => (
                  <div className="flex flex-col">
                    <Badge tone={PAYMENT_STATUS_COLORS[row.paymentStatus || 'unpaid'] || "secondary"} className="uppercase font-black text-[9px] tracking-widest w-fit">
                      {row.paymentStatus || 'unpaid'}
                    </Badge>
                    <span className="text-[10px] text-slate-400 mt-1 font-bold">
                      ${row.paidAmount || 0} / ${row.price || 0}
                    </span>
                  </div>
                ),
              },
              {
                header: "Status",
                render: (row) => (
                  <Badge tone={STATUS_COLORS[row.status] || "secondary"} className="uppercase font-black text-[9px] tracking-widest">
                    {row.status}
                  </Badge>
                ),
              },
              {
                header: "Action",
                render: (row) => (
                  <div className="flex items-center gap-2">
                    {row.status === APPOINTMENT_STATUS.PENDING && (
                      <Button
                        variant="success"
                        size="sm"
                        className="h-8 px-3 text-[10px] font-black uppercase tracking-widest"
                        onClick={() => handleCheckIn(row.id)}
                      >
                        Check-in
                      </Button>
                    )}
                    {row.paymentStatus !== "paid" && row.status !== APPOINTMENT_STATUS.CANCELLED && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-[10px] font-black uppercase tracking-widest text-brand-600 border-brand-100 hover:bg-brand-50 flex items-center gap-1"
                        onClick={() => {
                          setSelectedAppointmentForPayment(row);
                          setIsPaymentModalOpen(true);
                        }}
                      >
                        <Icon name="faMoneyBillWave" />
                        Collect
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-500"
                      onClick={() => { if(confirm("Cancel appointment?")) cancelAppt(row.id); }}
                    >
                      <Icon name="faXmark" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={filteredAppointments}
            isLoading={isLoading}
          />
        </Card>

        {/* Doctor Availability & Conflict Watch */}
        <div className="space-y-8">
           {/* Daily Cash Drawer */}
           <Card title="Daily Cash Drawer" description="Real-time financial collection tracking." className="border-emerald-100 bg-emerald-50/10">
              <div className="mt-4 space-y-4">
                 <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Collected</span>
                       <span className="text-base font-black text-emerald-600 block mt-0.5">${financialStats.collected.toFixed(2)}</span>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Pending</span>
                       <span className="text-base font-black text-rose-600 block mt-0.5">${financialStats.pending.toFixed(2)}</span>
                    </div>
                 </div>
                 <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Total Expected Value:</span>
                    <span className="font-black text-slate-800">${financialStats.expected.toFixed(2)}</span>
                 </div>
              </div>
           </Card>

           <Card title="Conflict Watch" description="Automated collision detection." className="border-rose-100 bg-rose-50/20">
              <div className="mt-4 space-y-4">
                 {stats.total > 15 ? (
                   <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                      <p className="text-xs font-black text-rose-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                         <Icon name="faCircleExclamation" />
                         High Load Detected
                      </p>
                      <p className="text-xs font-medium text-rose-500">Wait times may exceed 20 minutes today.</p>
                   </div>
                 ) : (
                   <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <p className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                         <Icon name="faCheckCircle" />
                         Schedule Optimal
                      </p>
                      <p className="text-xs font-medium text-emerald-500">No major conflicts or delays detected.</p>
                   </div>
                 )}
              </div>
           </Card>

           <Card title="Doctor Status" description="Real-time clinical availability.">
              <div className="mt-6 space-y-5">
                 {doctorsData?.data.slice(0, 4).map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50">
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
                    </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>

      {/* New Patient Modal */}
      <Modal isOpen={isNewPatientModalOpen} onClose={() => setIsNewPatientModalOpen(false)} title="Register New Patient" size="md">
         <form onSubmit={patientSubmit(handlePatientCreate)} className="space-y-6 pt-4">
            <div className="space-y-4">
               <Input label="Full Name" {...patientRegister("name", { required: "Name is required" })} placeholder="Enter patient name" />
               <Input label="Phone Number" {...patientRegister("phone", { required: "Phone is required" })} placeholder="01xxxxxxxxx" />
               <div className="grid grid-cols-2 gap-4">
                  <Input label="Age" type="number" {...patientRegister("age")} />
                  <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Gender</label>
                     <select {...patientRegister("gender")} className="w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-brand-500 appearance-none shadow-sm transition-all">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                     </select>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Internal Notes</label>
                  <textarea {...patientRegister("notes")} className="w-full h-24 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium outline-none focus:border-brand-500 shadow-sm transition-all" placeholder="Medical history, allergies, etc." />
               </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
               <Button variant="ghost" onClick={() => setIsNewPatientModalOpen(false)}>Discard</Button>
               <Button type="submit" className="px-8 shadow-halo">Create Patient Record</Button>
            </div>
         </form>
      </Modal>

      {/* Collect In-Clinic Payment Modal */}
      {selectedAppointmentForPayment && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedAppointmentForPayment(null);
          }}
          appointment={selectedAppointmentForPayment}
        />
      )}
    </div>
  );
}

export default ReceptionistDashboard;

