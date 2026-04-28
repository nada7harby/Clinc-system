import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  useStats,
  useRevenueChart,
  useStatusChart,
  useBookingsChart,
  useTopDoctors,
  useLogs,
} from "@/hooks/useAnalytics";
import { useUsers } from "@/hooks/useUsers";
import StatCard from "@/features/dashboard/StatCard";
import { Card, Icon, Button, Badge } from "@/components";
import { motion } from "framer-motion";
import { classNames } from "@/utils";
import { ROLES, STATUS_COLORS } from "@/constants/appConstants";

function AdminDashboard() {
  const [period, setPeriod] = useState("monthly");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: revenueData } = useRevenueChart(period);
  const { data: statusData } = useStatusChart();
  const { data: bookingsData } = useBookingsChart();
  const { data: topDoctors } = useTopDoctors();
  const { data: logs } = useLogs();
  const { data: doctorsData } = useUsers({ role: ROLES.DOCTOR });

  const weeklyTotal = bookingsData?.reduce((sum, item) => sum + item.bookings, 0) || 0;
  const lastWeekTotal = Math.max(0, Math.round(weeklyTotal * 0.92));

  const recentAppointments = [
    { patient: "Youssef Ibrahim", doctor: "Dr. Ahmed", time: "09:00", status: "confirmed" },
    { patient: "Mariam Ali", doctor: "Dr. Ahmed", time: "10:30", status: "pending" },
    { patient: "Khaled El-Sayed", doctor: "Dr. Layla", time: "11:30", status: "confirmed" },
  ];

  const newPatients = [
    { name: "Hala Mohammed", createdAt: "Today" },
    { name: "Mariam Ali", createdAt: "Yesterday" },
    { name: "Khaled El-Sayed", createdAt: "2 days ago" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10 pb-12"
    >
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Decision Center • Real-time
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            Clinic Overview
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-2xl bg-white p-1.5 border border-slate-100 shadow-sm">
            {[
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={classNames(
                  "px-4 py-2 text-xs font-bold rounded-xl transition-all",
                  period === option.value
                    ? "bg-slate-950 text-white"
                    : "text-slate-500 hover:bg-slate-50",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <select
            value={doctorFilter}
            onChange={(event) => setDoctorFilter(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-4 focus:ring-brand-500/10"
          >
            <option value="all">All Doctors</option>
            {doctorsData?.data.map((doc) => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </select>
          <Button variant="primary" className="gap-2 h-12 rounded-2xl">
            <Icon name="faFileExport" />
            Export
          </Button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients}
          icon="faHospitalUser"
          trend="up"
          trendValue="12.4%"
          isLoading={statsLoading}
        />
        <StatCard
          title="Scheduled"
          value={stats?.totalAppointments}
          icon="faCalendarCheck"
          trend="up"
          trendValue="8.1%"
          isLoading={statsLoading}
          variant="success"
        />
        <StatCard
          title="Revenue"
          value={`$${(stats?.totalRevenue / 1000).toFixed(1)}k`}
          icon="faWallet"
          trend="up"
          trendValue="15.2%"
          isLoading={statsLoading}
          variant="warning"
        />
        <StatCard
          title="Active Staff"
          value={stats?.totalDoctors}
          icon="faUserMd"
          trend="up"
          trendValue="2.5%"
          isLoading={statsLoading}
          variant="primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Revenue Performance Bar Chart */}
        <Card
          className="lg:col-span-2"
          title="Revenue Performance"
          description="Tracking monthly earnings against projected goals."
        >
          <div className="mt-8 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barSize={18}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    background: "#fff",
                  }}
                />
                <Bar dataKey="revenue" fill="#7e6363" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Appointment Status Pie Chart */}
        <Card
          title="Appointment Status"
          description="Breakdown of booking success rates."
        >
          <div className="mt-8 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusData?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    background: "#fff",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", fontWeight: "bold" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Bookings over time Line Chart */}
        <Card
          title="Daily Bookings"
          description="Volume of appointments across the current week."
        >
          <div className="mt-8 h-80 w-full relative">
            {!bookingsData && (
               <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
               </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingsData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    background: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#307672"
                  strokeWidth={4}
                  dot={{
                    r: 6,
                    fill: "#307672",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="This Week vs Last Week"
          description="Operational performance comparison."
        >
          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">This Week</p>
                <p className="text-2xl font-black text-slate-900 mt-2">{weeklyTotal}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-500">+6.4%</p>
                <p className="text-xs font-bold text-slate-400">vs last week</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Last Week</p>
                <p className="text-2xl font-black text-slate-900 mt-2">{lastWeekTotal}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Baseline</p>
                <p className="text-xs font-bold text-slate-400">Previous period</p>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-brand-50/70 border border-brand-100 px-5 py-4">
            <p className="text-xs font-black uppercase tracking-widest text-brand-600">Top Doctor</p>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {topDoctors?.[0]?.name || "No data"}
            </p>
            <p className="text-xs font-semibold text-slate-500">
              {topDoctors?.[0]?.specialty || ""}
            </p>
          </div>
        </Card>

        {/* Top Doctors Table */}
        <Card
          title="Top Performing Staff"
          description="Highest rated doctors by patient volume and feedback."
        >
          <div className="mt-6 space-y-6">
            {!topDoctors && (
               <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Icon name="faUserMd" className="text-3xl mb-2 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">Loading staff data...</p>
               </div>
            )}
            {topDoctors?.map((doc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-glow">
                    {doc.name.includes("Dr. ") ? doc.name.split("Dr. ")[1].charAt(0) : doc.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-none">
                      {doc.name}
                    </h4>
                    <p className="mt-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {doc.specialty}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 leading-none">
                    {doc.appointments}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1 text-brand-600">
                    <Icon name="faStar" className="text-[10px]" />
                    <span className="text-xs font-bold">{doc.rating}</span>
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="ghost"
              className="w-full text-xs font-bold uppercase tracking-widest text-brand-600"
            >
              View All Staff
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card
          title="Recent Appointments"
          description="Latest bookings and confirmations."
        >
          <div className="mt-6 space-y-4">
            {recentAppointments.map((appt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">{appt.patient}</p>
                  <p className="text-xs font-semibold text-slate-500">{appt.doctor}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={STATUS_COLORS[appt.status] || "secondary"}>
                    {appt.status}
                  </Badge>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">{appt.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="New Patients"
          description="Recently added to the registry."
        >
          <div className="mt-6 space-y-4">
            {newPatients.map((patient, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">{patient.name}</p>
                  <p className="text-xs font-semibold text-slate-500">Registered {patient.createdAt}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-9 px-3 text-xs">
                  View Profile
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity Logs Feed */}
      <Card
        title="System Activity Audit"
        description="Detailed log of recent management and clinical actions."
      >
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[100px]">
          {!logs && (
             <div className="col-span-full flex items-center justify-center py-10 text-slate-300">
                <p className="text-sm font-bold uppercase tracking-[0.2em]">Synchronizing system logs...</p>
             </div>
          )}
          {logs?.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 group"
            >
              <div
                className={classNames(
                  "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 transition-all group-hover:scale-110",
                  log.color,
                )}
              >
                <Icon name={log.icon} size="sm" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {log.user}{" "}
                    <span className="font-medium text-slate-500">
                      {log.action}
                    </span>{" "}
                    {log.target}
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                    {log.time}
                  </span>
                </div>
                <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={classNames(
                      "h-full w-1/3 rounded-full opacity-30",
                      log.color.replace("text-", "bg-"),
                    )}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

export default AdminDashboard;
