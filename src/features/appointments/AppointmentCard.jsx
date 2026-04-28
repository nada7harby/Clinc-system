import { motion } from "framer-motion";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components";
import { classNames } from "@/utils";
import { STATUS_COLORS } from "@/constants/appConstants";

const AppointmentCard = ({ appointment, onClick, onAction, compact = false }) => {
  const accentColors = {
    confirmed: "bg-emerald-500",
    pending: "bg-amber-500",
    cancelled: "bg-rose-500",
    completed: "bg-brand-500",
  };

  return (
    <motion.div
      layoutId={`appt-${appointment.id}`}
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={() => onClick(appointment)}
      className={classNames(
        "group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 cursor-pointer",
        compact ? "p-3" : "p-4",
        "hover:shadow-md hover:border-brand-500/20"
      )}
    >
      {/* Side Accent */}
      <div className={classNames(
        "absolute left-0 top-0 bottom-0 w-1",
        accentColors[appointment.status] || "bg-slate-300"
      )} />

      <div className="relative flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <span className="text-[9px] font-black text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md uppercase">
            {appointment.time}
          </span>
          {!compact && (
            <Badge tone={STATUS_COLORS[appointment.status]} className="text-[8px] px-1.5 py-0 uppercase font-black">
              {appointment.status}
            </Badge>
          )}
        </div>

        <div>
          <h4 className={classNames(
            "font-black text-slate-900 leading-tight truncate",
            compact ? "text-[11px]" : "text-sm"
          )}>
            {appointment.patientName}
          </h4>
          <p className="text-[9px] font-bold text-slate-400 uppercase truncate">
            {appointment.serviceName}
          </p>
        </div>

        {!compact && (
          <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
               <Icon name="faUserMd" className="text-slate-300 text-[9px]" />
               <span className="text-[9px] font-bold text-slate-500 truncate">{appointment.doctorName}</span>
            </div>
          </div>
        )}

        {/* Action Overlay (Only for non-compact or on hover) */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
           <button 
             onClick={(e) => { e.stopPropagation(); onAction('edit', appointment); }}
             className="h-7 w-7 rounded-lg bg-slate-100 text-slate-600 hover:bg-brand-500 hover:text-white transition-all flex items-center justify-center"
           >
              <Icon name="faPen" className="text-[10px]" />
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); onAction('cancel', appointment); }}
             className="h-7 w-7 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
           >
              <Icon name="faTimes" className="text-[10px]" />
           </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AppointmentCard;
