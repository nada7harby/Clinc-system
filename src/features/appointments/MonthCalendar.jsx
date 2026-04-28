import { useState, useMemo } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  isWeekend
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/Icon";
import { classNames } from "@/utils";
import { Badge } from "@/components";
import { STATUS_COLORS } from "@/constants/appConstants";

const MiniAppointmentCard = ({ appointment, onClick }) => {
  const statusColors = {
    confirmed: "bg-emerald-500",
    pending: "bg-amber-500",
    cancelled: "bg-rose-500",
    completed: "bg-brand-500",
  };

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onClick(appointment); }}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-slate-100 shadow-sm cursor-pointer hover:border-brand-500/30 transition-all group"
    >
      <div className={classNames("h-1.5 w-1.5 rounded-full shrink-0", statusColors[appointment.status])} />
      <span className="text-[9px] font-black text-slate-400 shrink-0 uppercase">{appointment.time}</span>
      <span className="text-[10px] font-bold text-slate-700 truncate group-hover:text-brand-600 transition-colors">
        {appointment.patientName}
      </span>
    </div>
  );
};

const MonthCalendar = ({ appointments, onEditAppointment, onAddAppointment }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="flex flex-col gap-6">
      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-white shadow-glass">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
             <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all"><Icon name="faChevronLeft" size="xs" /></button>
             <button onClick={goToToday} className="px-3 h-8 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white hover:shadow-sm transition-all">Today</button>
             <button onClick={nextMonth} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all"><Icon name="faChevronRight" size="xs" /></button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-glass overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-4 text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{d}</span>
            </div>
          ))}
        </div>

        {/* Month Grid Cells */}
        <div className="grid grid-cols-7 grid-rows-5 lg:grid-rows-6">
          {days.map((day, idx) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayAppts = appointments.filter(a => a.date === dateStr);
            const isOutside = !isSameMonth(day, currentMonth);
            
            return (
              <div 
                key={idx}
                onClick={() => onAddAppointment(dateStr)}
                className={classNames(
                  "min-h-[140px] p-3 border-r border-b border-slate-50 transition-all cursor-pointer relative group",
                  isOutside ? "bg-slate-50/30 opacity-40" : "bg-white hover:bg-slate-50/50",
                  isWeekend(day) && !isOutside ? "bg-slate-50/20" : ""
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={classNames(
                    "text-xs font-black h-7 w-7 flex items-center justify-center rounded-full transition-all",
                    isToday(day) ? "bg-brand-500 text-white shadow-glow" : "text-slate-400 group-hover:text-slate-900"
                  )}>
                    {format(day, "d")}
                  </span>
                  {dayAppts.length > 0 && (
                     <div className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse"></div>
                  )}
                </div>

                <div className="space-y-1.5">
                   {dayAppts.slice(0, 3).map(appt => (
                     <MiniAppointmentCard 
                       key={appt.id} 
                       appointment={appt} 
                       onClick={onEditAppointment} 
                     />
                   ))}
                   {dayAppts.length > 3 && (
                     <div 
                       onClick={(e) => { e.stopPropagation(); setSelectedDay({ date: dateStr, appts: dayAppts }); }}
                       className="text-[9px] font-black text-brand-600 uppercase tracking-widest pl-2 hover:underline"
                     >
                       + {dayAppts.length - 3} more
                     </div>
                   )}
                </div>

                {/* Add Indicator on Hover */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="h-6 w-6 rounded-lg bg-brand-500 text-white flex items-center justify-center shadow-halo">
                      <Icon name="faPlus" size="xs" />
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal (For "+More") */}
      <AnimatePresence>
        {selectedDay && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setSelectedDay(null)}
               className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-md rounded-[32px] bg-white shadow-2xl overflow-hidden"
             >
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                   <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                        {format(new Date(selectedDay.date), "EEEE, MMM d")}
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {selectedDay.appts.length} Appointments scheduled
                      </p>
                   </div>
                   <button onClick={() => setSelectedDay(null)} className="h-10 w-10 rounded-full bg-white text-slate-400 hover:text-slate-900 shadow-sm flex items-center justify-center transition-all">
                      <Icon name="faTimes" />
                   </button>
                </div>
                <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
                   {selectedDay.appts.map(appt => (
                     <div 
                       key={appt.id}
                       onClick={() => { onEditAppointment(appt); setSelectedDay(null); }}
                       className="p-4 rounded-2xl border border-slate-100 hover:border-brand-500/20 hover:bg-brand-50/30 transition-all cursor-pointer group"
                     >
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-black text-brand-600 uppercase">{appt.time}</span>
                           <Badge tone={STATUS_COLORS[appt.status]} className="text-[8px] font-black uppercase px-2 py-0">{appt.status}</Badge>
                        </div>
                        <h4 className="font-black text-slate-900 leading-none group-hover:text-brand-600 transition-colors">{appt.patientName}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{appt.serviceName}</p>
                     </div>
                   ))}
                </div>
                <div className="p-4 bg-slate-50 flex justify-center">
                   <button 
                     onClick={() => { onAddAppointment(selectedDay.date); setSelectedDay(null); }}
                     className="flex items-center gap-2 text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline"
                   >
                      <Icon name="faPlus" />
                      Add new for this day
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MonthCalendar;
