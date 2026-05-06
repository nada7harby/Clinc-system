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
} from "@/hooks/useAnalytics";
import { useUsers } from "@/hooks/useUsers";
import StatCard from "@/features/dashboard/StatCard";
import { Card, Icon, Button, Badge, Table } from "@/components";
import { motion } from "framer-motion";
import { classNames } from "@/utils";
import { ROLES, STATUS_COLORS } from "@/constants/appConstants";
import toast from "react-hot-toast";

function AdminDashboard() {
  const [period, setPeriod] = useState("monthly");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30d");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: "30d",
    doctorId: "all",
    service: "all",
    status: "all",
  });
  const {
    data: stats,
    isLoading: statsLoading,
    dataUpdatedAt: statsUpdatedAt,
  } = useStats(appliedFilters, {
    refetchInterval: 300000,
  });
  const { data: revenueData } = useRevenueChart(period, appliedFilters, {
    refetchInterval: 300000,
  });
  const { data: statusData } = useStatusChart(appliedFilters, {
    refetchInterval: 300000,
  });
  const { data: bookingsData } = useBookingsChart(appliedFilters, {
    refetchInterval: 300000,
  });
  const { data: topDoctors } = useTopDoctors(appliedFilters, {
    refetchInterval: 300000,
  });
  const { data: doctorsData } = useUsers({ role: ROLES.DOCTOR });
  const [queueDoctorFilter, setQueueDoctorFilter] = useState("all");
  const [queueStatusFilter, setQueueStatusFilter] = useState("all");
  const [queueSearch, setQueueSearch] = useState("");
  const [appliedQueueFilters, setAppliedQueueFilters] = useState({
    doctor: "all",
    status: "all",
    search: "",
  });
  const totalRevenue = stats?.totalRevenue || 0;
  const totalPatients = stats?.totalPatients || 0;
  const dailyAppointments =
    bookingsData?.[bookingsData.length - 1]?.bookings || 0;
  const statusTotal =
    statusData?.reduce((sum, item) => sum + item.value, 0) || 0;
  const cancellationTotal =
    statusData?.find((item) => item.name === "Cancelled")?.value || 0;
  const cancellationRate = statusTotal
    ? ((cancellationTotal / statusTotal) * 100).toFixed(1)
    : "0.0";
  const clinicOccupancy = Math.min(
    100,
    Math.round((dailyAppointments / 90) * 100),
  );
  const doctorPerformanceScore = topDoctors?.[0]?.rating
    ? `${topDoctors[0].rating.toFixed(1)}/5`
    : "4.8/5";
  const lastSyncLabel = statsUpdatedAt
    ? new Date(statsUpdatedAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  const appointmentDistribution = [
    { name: "New Patient", value: 38, color: "#7e6363" },
    { name: "Follow-up", value: 44, color: "#307672" },
    { name: "Diagnostics", value: 18, color: "#f59e0b" },
  ];

  const cancellationTrend = [
    { day: "Mon", cancellations: 3 },
    { day: "Tue", cancellations: 6 },
    { day: "Wed", cancellations: 4 },
    { day: "Thu", cancellations: 7 },
    { day: "Fri", cancellations: 5 },
    { day: "Sat", cancellations: 2 },
    { day: "Sun", cancellations: 1 },
  ];

  const peakHours = [
    { hour: "08:00", intensity: 0.3 },
    { hour: "09:00", intensity: 0.5 },
    { hour: "10:00", intensity: 0.9 },
    { hour: "11:00", intensity: 0.85 },
    { hour: "12:00", intensity: 0.7 },
    { hour: "13:00", intensity: 0.6 },
    { hour: "14:00", intensity: 0.8 },
    { hour: "15:00", intensity: 0.65 },
    { hour: "16:00", intensity: 0.55 },
    { hour: "17:00", intensity: 0.4 },
  ];

  const operationalInsights = [
    {
      title: "Most booked doctor",
      value: topDoctors?.[0]?.name || "No data",
      subtext: topDoctors?.[0]?.specialty || "Awaiting specialty",
      tone: "primary",
    },
    {
      title: "Highest cancellation period",
      value: "Tue 2-4 PM",
      subtext: "12% cancel rate",
      tone: "danger",
    },
    {
      title: "Busiest clinic hours",
      value: "10:00 - 12:00",
      subtext: "Avg 22 check-ins",
      tone: "success",
    },
    {
      title: "Low occupancy alert",
      value: "Saturday",
      subtext: "Occupancy 38%",
      tone: "warning",
    },
  ];

  const queueData = [
    {
      id: "q1",
      position: 1,
      patient: "Hala Mohammed",
      doctor: "Dr. Ahmed Mansour",
      eta: "5 min",
      status: "ready",
      room: "A2",
      wait: 8,
    },
    {
      id: "q2",
      position: 2,
      patient: "Mariam Ali",
      doctor: "Dr. Layla Hassan",
      eta: "12 min",
      status: "waiting",
      room: "B1",
      wait: 14,
    },
    {
      id: "q3",
      position: 3,
      patient: "Khaled El-Sayed",
      doctor: "Dr. Ahmed Mansour",
      eta: "18 min",
      status: "waiting",
      room: "A2",
      wait: 20,
    },
    {
      id: "q4",
      position: 4,
      patient: "Youssef Ibrahim",
      doctor: "Dr. Fatima Al-Zahra",
      eta: "24 min",
      status: "delayed",
      room: "C3",
      wait: 28,
    },
  ];

  const inventoryData = [
    {
      id: "i1",
      item: "Amoxicillin 500mg",
      category: "Medicines",
      quantity: 12,
      minimum: 30,
      expiry: "2026-01-20",
      status: "low",
    },
    {
      id: "i2",
      item: "Latex Gloves",
      category: "Supplies",
      quantity: 320,
      minimum: 150,
      expiry: "2027-05-11",
      status: "healthy",
    },
    {
      id: "i3",
      item: "Ultrasound Gel",
      category: "Supplies",
      quantity: 18,
      minimum: 40,
      expiry: "2026-03-02",
      status: "critical",
    },
    {
      id: "i4",
      item: "ECG Leads",
      category: "Equipment",
      quantity: 5,
      minimum: 8,
      expiry: "2027-12-01",
      status: "low",
    },
    {
      id: "i5",
      item: "Insulin Pens",
      category: "Medicines",
      quantity: 42,
      minimum: 35,
      expiry: "2026-05-18",
      status: "expiring",
    },
  ];

  const inventoryConsumption = [
    { month: "Jan", consumption: 120 },
    { month: "Feb", consumption: 136 },
    { month: "Mar", consumption: 148 },
    { month: "Apr", consumption: 162 },
    { month: "May", consumption: 154 },
    { month: "Jun", consumption: 172 },
  ];

  const auditLogData = [
    {
      id: "a1",
      user: "Mostafa Mahmoud",
      action: "Updated inventory threshold",
      module: "Inventory",
      timestamp: "Today 09:12",
      source: "10.0.12.3 / Chrome (Windows)",
    },
    {
      id: "a2",
      user: "Nour El-Din",
      action: "Reordered queue",
      module: "Queue",
      timestamp: "Today 08:58",
      source: "10.0.11.9 / Edge (Windows)",
    },
    {
      id: "a3",
      user: "System",
      action: "Exported monthly revenue report",
      module: "Analytics",
      timestamp: "Yesterday 18:20",
      source: "Automated / Scheduler",
    },
    {
      id: "a4",
      user: "Dr. Ahmed Mansour",
      action: "Completed appointment a1",
      module: "Appointments",
      timestamp: "Yesterday 15:44",
      source: "10.0.14.2 / Safari (Mac)",
    },
  ];

  const permissionMatrix = [
    {
      module: "Appointments",
      admin: ["View", "Edit", "Delete", "Export"],
      doctor: ["View", "Edit"],
      receptionist: ["View", "Edit", "Export"],
    },
    {
      module: "Inventory",
      admin: ["View", "Edit", "Delete", "Export"],
      doctor: ["View"],
      receptionist: ["View", "Edit"],
    },
    {
      module: "Queue",
      admin: ["View", "Edit", "Export"],
      doctor: ["View"],
      receptionist: ["View", "Edit"],
    },
    {
      module: "Users",
      admin: ["View", "Edit", "Delete", "Manage Users"],
      doctor: [],
      receptionist: ["View"],
    },
  ];

  const recentAppointments = [
    {
      patient: "Youssef Ibrahim",
      doctor: "Dr. Ahmed",
      time: "09:00",
      status: "confirmed",
    },
    {
      patient: "Mariam Ali",
      doctor: "Dr. Ahmed",
      time: "10:30",
      status: "pending",
    },
    {
      patient: "Khaled El-Sayed",
      doctor: "Dr. Layla",
      time: "11:30",
      status: "confirmed",
    },
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

  const handleApplyFilters = () => {
    setAppliedFilters({
      dateRange,
      doctorId: doctorFilter,
      service: serviceFilter,
      status: statusFilter,
    });
  };

  const handleApplyQueueFilters = () => {
    setAppliedQueueFilters({
      doctor: queueDoctorFilter,
      status: queueStatusFilter,
      search: queueSearch.trim().toLowerCase(),
    });
  };

  const exportToCsv = (rows, filename) => {
    if (!rows || rows.length === 0) {
      toast.error("No data available to export.");
      return;
    }
    const headers = Object.keys(rows[0]);
    const escapeValue = (value) => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    };
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((header) => escapeValue(row[header])).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Export completed.");
  };

  const filteredQueueData = queueData.filter((item) => {
    const matchesDoctor =
      appliedQueueFilters.doctor === "all" ||
      item.doctor === appliedQueueFilters.doctor;
    const matchesStatus =
      appliedQueueFilters.status === "all" ||
      item.status === appliedQueueFilters.status;
    const matchesSearch = appliedQueueFilters.search
      ? item.patient.toLowerCase().includes(appliedQueueFilters.search)
      : true;
    return matchesDoctor && matchesStatus && matchesSearch;
  });

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
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
          <Button variant="primary" className="gap-2 h-12 rounded-2xl">
            <Icon name="faFileExport" />
            Export
          </Button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard
          title="Total Revenue"
          value={`$${(totalRevenue / 1000).toFixed(1)}k`}
          icon="faWallet"
          trend="up"
          trendValue="11.6%"
          isLoading={statsLoading}
          variant="warning"
          layout="compact"
        />
        <StatCard
          title="Daily Appointments"
          value={dailyAppointments}
          icon="faCalendarCheck"
          trend="up"
          trendValue="6.8%"
          isLoading={statsLoading}
          variant="success"
          layout="compact"
        />
        <StatCard
          title="Cancellation Rate"
          value={`${cancellationRate}%`}
          icon="faBan"
          trend="down"
          trendValue="1.3%"
          isLoading={statsLoading}
          variant="danger"
          layout="compact"
        />
        <StatCard
          title="Active Patients"
          value={totalPatients}
          icon="faHospitalUser"
          trend="up"
          trendValue="4.2%"
          isLoading={statsLoading}
          variant="primary"
          layout="compact"
        />
        <StatCard
          title="Clinic Occupancy Rate"
          value={`${clinicOccupancy}%`}
          icon="faHeartbeat"
          trend="up"
          trendValue="3.4%"
          isLoading={statsLoading}
          variant="success"
          layout="compact"
        />
        <StatCard
          title="Doctor Performance Score"
          value={doctorPerformanceScore}
          icon="faStar"
          trend="up"
          trendValue="0.2"
          isLoading={statsLoading}
          variant="primary"
          layout="compact"
        />
      </div>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="hud-chip">Reports and analytics</div>
            <h2 className="mt-3 text-2xl font-black text-slate-950">
              Operational analytics
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Track revenue, cancellations, doctor performance, and peak clinic
              hours.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live refresh every 5 minutes
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Icon name="faClock" className="text-[10px]" />
              Last sync {lastSyncLabel}
            </span>
          </div>
        </div>

        <Card className="p-0" variant="premium">
          <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Date range
              </span>
              {[
                { label: "7D", value: "7d" },
                { label: "30D", value: "30d" },
                { label: "90D", value: "90d" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value)}
                  className={classNames(
                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all",
                    dateRange === option.value
                      ? "bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-900/20"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <select
                value={doctorFilter}
                onChange={(event) => setDoctorFilter(event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-4 focus:ring-brand-500/10"
              >
                <option value="all">All Doctors</option>
                {doctorsData?.data.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
              <select
                value={serviceFilter}
                onChange={(event) => setServiceFilter(event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-4 focus:ring-brand-500/10"
              >
                <option value="all">All Services</option>
                <option value="general">General Consultation</option>
                <option value="cardiology">Cardiology</option>
                <option value="neurology">Neurology</option>
                <option value="pediatrics">Pediatrics</option>
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-4 focus:ring-brand-500/10"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <Button
              variant="primary"
              className="h-11 gap-2 rounded-2xl"
              onClick={handleApplyFilters}
            >
              <Icon name="faFilter" />
              Apply
            </Button>
          </div>
        </Card>
      </section>

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
          title="Cancellation Analytics"
          description="Daily cancellations and operational impact."
        >
          <div className="mt-8 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cancellationTrend}>
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
                  dataKey="cancellations"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#ef4444" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Doctor Performance Comparison"
          description="Appointments handled and patient rating by doctor."
        >
          <div className="mt-8 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDoctors} barSize={18}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
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
                <Bar
                  dataKey="appointments"
                  fill="#307672"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Appointment Distribution"
          description="Patient mix by appointment type."
        >
          <div className="mt-8 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appointmentDistribution}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {appointmentDistribution.map((entry, index) => (
                    <Cell
                      key={`dist-${index}`}
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

      <Card
        title="Peak Clinic Hours"
        description="Heatmap of demand intensity during the day."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {peakHours.map((slot) => (
            <div
              key={slot.hour}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
            >
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {slot.hour}
              </p>
              <div
                className={classNames(
                  "mt-3 h-3 w-full rounded-full",
                  slot.intensity > 0.8
                    ? "bg-rose-500"
                    : slot.intensity > 0.6
                    ? "bg-amber-500"
                    : slot.intensity > 0.4
                    ? "bg-brand-500"
                    : "bg-slate-200",
                )}
              ></div>
              <p className="mt-3 text-xs font-semibold text-slate-500">
                Demand {Math.round(slot.intensity * 100)}%
              </p>
            </div>
          ))}
        </div>
      </Card>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="hud-chip">Operational insights</div>
            <h2 className="mt-3 text-2xl font-black text-slate-950">
              Executive signals
            </h2>
          </div>
          <Button variant="ghost" className="h-11 px-5 text-xs font-bold">
            Review weekly briefing
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {operationalInsights.map((insight) => (
            <Card key={insight.title} className="p-0">
              <div className="p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {insight.title}
                </p>
                <p className="mt-3 text-lg font-black text-slate-950">
                  {insight.value}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {insight.subtext}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="hud-chip">Queue management</div>
            <h2 className="mt-3 text-2xl font-black text-slate-950">
              Live waiting operations
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="h-11 px-5">
              <Icon name="faHeadset" className="mr-2" />
              Call next
            </Button>
            <Button variant="outline" className="h-11 px-5">
              <Icon name="faRedo" className="mr-2" />
              Reorder queue
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <Card
            className="xl:col-span-2"
            title="Queue dashboard"
            description="Live queue, ETA, and room coordination."
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Icon
                  name="faSearch"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                />
                <input
                  type="text"
                  placeholder="Search patient"
                  className="h-11 w-full rounded-2xl border-2 border-transparent bg-white pl-11 pr-4 text-xs font-bold text-slate-900 outline-none focus:border-brand-500/10 shadow-sm"
                  value={queueSearch}
                  onChange={(event) => setQueueSearch(event.target.value)}
                />
              </div>
              <select
                value={queueDoctorFilter}
                onChange={(event) => setQueueDoctorFilter(event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-4 focus:ring-brand-500/10"
              >
                <option value="all">All Doctors</option>
                {doctorsData?.data.map((doc) => (
                  <option key={doc.id} value={doc.name}>
                    {doc.name}
                  </option>
                ))}
              </select>
              <select
                value={queueStatusFilter}
                onChange={(event) => setQueueStatusFilter(event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-4 focus:ring-brand-500/10"
              >
                <option value="all">All Status</option>
                <option value="ready">Ready</option>
                <option value="waiting">Waiting</option>
                <option value="delayed">Delayed</option>
              </select>
              <Button
                variant="primary"
                className="h-11 px-5"
                onClick={handleApplyQueueFilters}
              >
                <Icon name="faFilter" className="mr-2" />
                Apply
              </Button>
            </div>
            <Table
              columns={[
                {
                  header: "Queue",
                  render: (row) => (
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-700">
                        {row.position}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {row.patient}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">
                          Room {row.room}
                        </p>
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Assigned Doctor",
                  render: (row) => (
                    <p className="text-sm font-bold text-slate-700">
                      {row.doctor}
                    </p>
                  ),
                },
                {
                  header: "ETA",
                  render: (row) => (
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {row.eta}
                      </p>
                      <p className="text-xs font-semibold text-slate-400">
                        Wait {row.wait} min
                      </p>
                    </div>
                  ),
                },
                {
                  header: "Status",
                  render: (row) => (
                    <Badge
                      tone={
                        row.status === "ready"
                          ? "success"
                          : row.status === "delayed"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {row.status}
                    </Badge>
                  ),
                },
                {
                  header: "Actions",
                  render: () => (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 text-xs"
                      >
                        Call
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 text-xs"
                      >
                        Skip
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={filteredQueueData}
            />
          </Card>

          <div className="space-y-6">
            <Card
              title="Live queue status"
              description="Real-time signals and waiting experience."
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Avg wait
                    </p>
                    <p className="text-2xl font-black text-slate-900 mt-2">
                      14 min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-500">
                      -2 min
                    </p>
                    <p className="text-xs font-semibold text-slate-400">
                      vs yesterday
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Patients waiting
                    </p>
                    <p className="text-2xl font-black text-slate-900 mt-2">7</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Threshold
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      10 max
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-4">
                  <p className="text-xs font-black uppercase tracking-widest text-brand-600">
                    Live updates
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Queue engine refreshed 45 seconds ago.
                  </p>
                </div>
              </div>
            </Card>

            <Card
              title="Waiting screen preview"
              description="Lobby display for clinic TVs."
            >
              <div className="rounded-2xl border border-slate-100 bg-slate-950 text-white p-6">
                <p className="text-xs font-black uppercase tracking-widest text-slate-300">
                  Now serving
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-5xl font-black">A102</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Room A2
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400">Up next</p>
                    <p className="text-lg font-bold">B208</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-400">
                  <div className="rounded-xl bg-white/10 px-3 py-2">B209</div>
                  <div className="rounded-xl bg-white/10 px-3 py-2">C014</div>
                  <div className="rounded-xl bg-white/10 px-3 py-2">A310</div>
                  <div className="rounded-xl bg-white/10 px-3 py-2">B102</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="hud-chip">Inventory and supplies</div>
            <h2 className="mt-3 text-2xl font-black text-slate-950">
              Clinical stock operations
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-11 px-5"
              onClick={() =>
                exportToCsv(inventoryData, "inventory-operations.csv")
              }
            >
              <Icon name="faFileExport" className="mr-2" />
              Export CSV
            </Button>
            <Button variant="primary" className="h-11 px-5">
              <Icon name="faPlus" className="mr-2" />
              Add inventory item
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <Card
            className="xl:col-span-2"
            title="Inventory table"
            description="Monitor stock, expiry, and usage risk."
          >
            <div className="space-y-4">
              <div className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-widest text-rose-600">
                  Critical alerts
                </p>
                <p className="mt-1 text-xs font-semibold text-rose-600">
                  2 items are below minimum stock. 1 item is expiring within 30
                  days.
                </p>
              </div>
              <Table
                columns={[
                  {
                    header: "Item",
                    render: (row) => (
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {row.item}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">
                          {row.category}
                        </p>
                      </div>
                    ),
                  },
                  {
                    header: "Quantity",
                    render: (row) => (
                      <p className="text-sm font-black text-slate-700">
                        {row.quantity}
                      </p>
                    ),
                  },
                  {
                    header: "Minimum",
                    render: (row) => (
                      <p className="text-sm font-semibold text-slate-500">
                        {row.minimum}
                      </p>
                    ),
                  },
                  {
                    header: "Expiration",
                    render: (row) => (
                      <p className="text-sm font-semibold text-slate-500">
                        {row.expiry}
                      </p>
                    ),
                  },
                  {
                    header: "Status",
                    render: (row) => (
                      <Badge
                        tone={
                          row.status === "critical"
                            ? "danger"
                            : row.status === "low"
                            ? "warning"
                            : row.status === "expiring"
                            ? "secondary"
                            : "success"
                        }
                      >
                        {row.status}
                      </Badge>
                    ),
                  },
                ]}
                data={inventoryData}
                rowClassName={(row) =>
                  row.status === "critical"
                    ? "ring-1 ring-rose-200"
                    : row.status === "low"
                    ? "ring-1 ring-amber-200"
                    : ""
                }
              />
            </div>
          </Card>

          <div className="space-y-6">
            <Card
              title="Inventory analytics"
              description="Supply consumption and trend signals."
            >
              <div className="mt-4 h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryConsumption} barSize={14}>
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
                      dy={10}
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
                    <Bar
                      dataKey="consumption"
                      fill="#7e6363"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Most used supplies</span>
                  <span className="text-slate-400">Monthly</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-bold text-slate-700">
                    Gloves
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    420 units
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-bold text-slate-700">
                    Syringes
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    310 units
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-bold text-slate-700">
                    Ultrasound gel
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    280 units
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="hud-chip">Permissions and audit</div>
            <h2 className="mt-3 text-2xl font-black text-slate-950">
              Enterprise access control
            </h2>
          </div>
          <Button variant="outline" className="h-11 px-5">
            <Icon name="faUserShield" className="mr-2" />
            Manage roles
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <Card
            title="Role permissions"
            description="Granular access by module and role."
          >
            <div className="space-y-5">
              {permissionMatrix.map((row) => (
                <div
                  key={row.module}
                  className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">
                      {row.module}
                    </p>
                    <Badge tone="secondary">Module</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {[
                      { label: "Admin", permissions: row.admin },
                      { label: "Doctor", permissions: row.doctor },
                      { label: "Receptionist", permissions: row.receptionist },
                    ].map((role) => (
                      <div
                        key={role.label}
                        className="rounded-xl bg-white px-3 py-3 border border-slate-100"
                      >
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                          {role.label}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {role.permissions.length ? (
                            role.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="rounded-full bg-brand-500/10 px-2.5 py-1 text-[10px] font-bold text-brand-700"
                              >
                                {permission}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400">
                              No access
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Audit log"
            description="Enterprise-grade tracking of operational actions."
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <select className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none">
                  <option>All Users</option>
                  <option>Admins</option>
                  <option>Doctors</option>
                  <option>Receptionists</option>
                </select>
                <select className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none">
                  <option>All Modules</option>
                  <option>Inventory</option>
                  <option>Queue</option>
                  <option>Analytics</option>
                  <option>Appointments</option>
                </select>
                <select className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none">
                  <option>All Actions</option>
                  <option>Update</option>
                  <option>Create</option>
                  <option>Delete</option>
                  <option>Export</option>
                </select>
                <Button
                  variant="outline"
                  className="h-10 px-4"
                  onClick={() =>
                    exportToCsv(auditLogData, "audit-log-export.csv")
                  }
                >
                  <Icon name="faFileExport" className="mr-2" />
                  Export
                </Button>
              </div>
              <Table
                columns={[
                  {
                    header: "User",
                    render: (row) => (
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {row.user}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">
                          {row.module}
                        </p>
                      </div>
                    ),
                  },
                  {
                    header: "Action",
                    render: (row) => (
                      <p className="text-sm font-semibold text-slate-600">
                        {row.action}
                      </p>
                    ),
                  },
                  {
                    header: "Timestamp",
                    render: (row) => (
                      <p className="text-xs font-semibold text-slate-500">
                        {row.timestamp}
                      </p>
                    ),
                  },
                  {
                    header: "Source",
                    render: (row) => (
                      <p className="text-xs font-semibold text-slate-500">
                        {row.source}
                      </p>
                    ),
                  },
                ]}
                data={auditLogData}
              />
            </div>
          </Card>
        </div>
      </section>

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
                  <p className="text-sm font-bold text-slate-900">
                    {appt.patient}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    {appt.doctor}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={STATUS_COLORS[appt.status] || "secondary"}>
                    {appt.status}
                  </Badge>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {appt.time}
                  </span>
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
                  <p className="text-sm font-bold text-slate-900">
                    {patient.name}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    Registered {patient.createdAt}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-9 px-3 text-xs">
                  View Profile
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

export default AdminDashboard;
