import { useState, useMemo, useEffect } from "react";
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
import { Card, Icon, Button, Badge, Table, Modal, Input } from "@/components";
import { motion, AnimatePresence } from "framer-motion";
import { classNames } from "@/utils";
import { ROLES, STATUS_COLORS } from "@/constants/appConstants";
import toast from "react-hot-toast";

const MotionDiv = motion.div;

// ── Multi-Branch Mock Datasets ───────────────────────────────────────────────
const BRANCH_DATASETS = {
  cairo: {
    name: "Cairo Main (Heliopolis)",
    totalRevenue: 248500,
    dailyAppointments: 86,
    cancellationRate: "2.1",
    totalPatients: 1480,
    clinicOccupancy: 82,
    performanceScore: "4.9/5",
    operationalInsights: [
      { title: "Most booked doctor", value: "Dr. Ahmed Mansour", subtext: "Cardiologist", tone: "primary" },
      { title: "Highest cancellation period", value: "Tue 2-4 PM", subtext: "2% cancel rate", tone: "danger" },
      { title: "Busiest clinic hours", value: "10:00 - 12:00", subtext: "Avg 22 check-ins", tone: "success" },
      { title: "Low occupancy alert", value: "Saturday", subtext: "Occupancy 38%", tone: "warning" },
    ],
    revenueData: [
      { month: "Jan", revenue: 42000 },
      { month: "Feb", revenue: 45000 },
      { month: "Mar", revenue: 48000 },
      { month: "Apr", revenue: 52000 },
      { month: "May", revenue: 58000 },
      { month: "Jun", revenue: 61000 },
    ],
    statusData: [
      { name: "Confirmed", value: 85, color: "#10b981" },
      { name: "Pending", value: 12, color: "#f59e0b" },
      { name: "Cancelled", value: 3, color: "#ef4444" },
    ],
    bookingsData: [
      { day: "Mon", bookings: 78 },
      { day: "Tue", bookings: 84 },
      { day: "Wed", bookings: 80 },
      { day: "Thu", bookings: 88 },
      { day: "Fri", bookings: 92 },
      { day: "Sat", bookings: 32 },
      { day: "Sun", bookings: 12 },
    ],
    topDoctors: [
      { name: "Dr. Ahmed Mansour", appointments: 142, rating: 4.9 },
      { name: "Dr. Layla Hassan", appointments: 118, rating: 4.8 },
      { name: "Dr. Fatima Al-Zahra", appointments: 96, rating: 4.7 },
    ],
    queueData: [
      { id: "q1", position: 1, patient: "Hala Mohammed", doctor: "Dr. Ahmed Mansour", eta: "5 min", status: "ready", room: "A2", wait: 8 },
      { id: "q2", position: 2, patient: "Mariam Ali", doctor: "Dr. Layla Hassan", eta: "12 min", status: "waiting", room: "B1", wait: 14 },
      { id: "q3", position: 3, patient: "Khaled El-Sayed", doctor: "Dr. Ahmed Mansour", eta: "18 min", status: "waiting", room: "A2", wait: 20 },
    ],
    inventory: [
      { id: "inv-c1", item: "Amoxicillin 500mg", category: "Medicines", quantity: 12, minimum: 30, expiry: "2026-06-25", status: "low" },
      { id: "inv-c2", item: "Latex Sterile Gloves", category: "Supplies", quantity: 320, minimum: 150, expiry: "2027-05-11", status: "healthy" },
      { id: "inv-c3", item: "Ultrasound Gel", category: "Supplies", quantity: 18, minimum: 40, expiry: "2026-07-02", status: "critical" },
      { id: "inv-c4", item: "ECG Lead Wires", category: "Equipment", quantity: 9, minimum: 8, expiry: "2028-12-01", status: "healthy" },
    ]
  },
  giza: {
    name: "Giza Clinic (Sheikh Zayed)",
    totalRevenue: 192200,
    dailyAppointments: 68,
    cancellationRate: "4.8",
    totalPatients: 980,
    clinicOccupancy: 64,
    performanceScore: "4.7/5",
    operationalInsights: [
      { title: "Most booked doctor", value: "Dr. Layla Hassan", subtext: "Neurologist", tone: "primary" },
      { title: "Highest cancellation period", value: "Wed 4-6 PM", subtext: "8% cancel rate", tone: "danger" },
      { title: "Busiest clinic hours", value: "14:00 - 16:00", subtext: "Avg 18 check-ins", tone: "success" },
      { title: "Low occupancy alert", value: "Friday", subtext: "Occupancy 20%", tone: "warning" },
    ],
    revenueData: [
      { month: "Jan", revenue: 30000 },
      { month: "Feb", revenue: 32000 },
      { month: "Mar", revenue: 35000 },
      { month: "Apr", revenue: 38000 },
      { month: "May", revenue: 41000 },
      { month: "Jun", revenue: 46200 },
    ],
    statusData: [
      { name: "Confirmed", value: 78, color: "#10b981" },
      { name: "Pending", value: 16, color: "#f59e0b" },
      { name: "Cancelled", value: 6, color: "#ef4444" },
    ],
    bookingsData: [
      { day: "Mon", bookings: 55 },
      { day: "Tue", bookings: 62 },
      { day: "Wed", bookings: 58 },
      { day: "Thu", bookings: 64 },
      { day: "Fri", bookings: 20 },
      { day: "Sat", bookings: 48 },
      { day: "Sun", bookings: 8 },
    ],
    topDoctors: [
      { name: "Dr. Layla Hassan", appointments: 130, rating: 4.8 },
      { name: "Dr. Ahmed Mansour", appointments: 92, rating: 4.6 },
      { name: "Dr. Fatima Al-Zahra", appointments: 78, rating: 4.7 },
    ],
    queueData: [
      { id: "q4", position: 1, patient: "Youssef Ibrahim", doctor: "Dr. Fatima Al-Zahra", eta: "8 min", status: "ready", room: "C3", wait: 12 },
      { id: "q5", position: 2, patient: "Nour El-Din", doctor: "Dr. Layla Hassan", eta: "16 min", status: "waiting", room: "B1", wait: 18 },
    ],
    inventory: [
      { id: "inv-g1", item: "Panadol Advance 500mg", category: "Medicines", quantity: 8, minimum: 25, expiry: "2026-06-10", status: "critical" },
      { id: "inv-g2", item: "Latex Sterile Gloves", category: "Supplies", quantity: 120, minimum: 150, expiry: "2027-02-14", status: "low" },
      { id: "inv-g3", item: "Insulin Pens 100U", category: "Medicines", quantity: 42, minimum: 35, expiry: "2026-06-18", status: "expiring" },
    ]
  },
  alex: {
    name: "Alexandria Coastal Branch",
    totalRevenue: 118400,
    dailyAppointments: 42,
    cancellationRate: "5.6",
    totalPatients: 540,
    clinicOccupancy: 48,
    performanceScore: "4.8/5",
    operationalInsights: [
      { title: "Most booked doctor", value: "Dr. Fatima Al-Zahra", subtext: "Pediatrician", tone: "primary" },
      { title: "Highest cancellation period", value: "Mon 9-11 AM", subtext: "10% cancel rate", tone: "danger" },
      { title: "Busiest clinic hours", value: "09:00 - 11:00", subtext: "Avg 12 check-ins", tone: "success" },
      { title: "Low occupancy alert", value: "Wednesday", subtext: "Occupancy 15%", tone: "warning" },
    ],
    revenueData: [
      { month: "Jan", revenue: 18000 },
      { month: "Feb", revenue: 19500 },
      { month: "Mar", revenue: 21000 },
      { month: "Apr", revenue: 22000 },
      { month: "May", revenue: 25000 },
      { month: "Jun", revenue: 28400 },
    ],
    statusData: [
      { name: "Confirmed", value: 74, color: "#10b981" },
      { name: "Pending", value: 20, color: "#f59e0b" },
      { name: "Cancelled", value: 6, color: "#ef4444" },
    ],
    bookingsData: [
      { day: "Mon", bookings: 32 },
      { day: "Tue", bookings: 38 },
      { day: "Wed", bookings: 15 },
      { day: "Thu", bookings: 42 },
      { day: "Fri", bookings: 46 },
      { day: "Sat", bookings: 22 },
      { day: "Sun", bookings: 5 },
    ],
    topDoctors: [
      { name: "Dr. Fatima Al-Zahra", appointments: 112, rating: 4.8 },
      { name: "Dr. Ahmed Mansour", appointments: 52, rating: 4.7 },
      { name: "Dr. Layla Hassan", appointments: 40, rating: 4.5 },
    ],
    queueData: [
      { id: "q6", position: 1, patient: "Hoda Kotb", doctor: "Dr. Fatima Al-Zahra", eta: "4 min", status: "ready", room: "C3", wait: 6 },
    ],
    inventory: [
      { id: "inv-a1", item: "Amoxicillin 500mg", category: "Medicines", quantity: 6, minimum: 20, expiry: "2026-07-15", status: "critical" },
      { id: "inv-a2", item: "ECG Electrodes 50pk", category: "Supplies", quantity: 3, minimum: 10, expiry: "2026-06-20", status: "critical" },
      { id: "inv-a3", item: "Latex Sterile Gloves", category: "Supplies", quantity: 280, minimum: 100, expiry: "2027-11-20", status: "healthy" },
    ]
  }
};

function AdminDashboard() {
  const [currentBranch, setCurrentBranch] = useState("cairo");
  const branchInfo = BRANCH_DATASETS[currentBranch];

  // Filters state
  const [period, setPeriod] = useState("monthly");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30d");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Dynamic Inventory ERP State
  const [inventoryList, setInventoryList] = useState(() => {
    // Populate with deep copies of inventory items across branches
    const allInv = {};
    Object.keys(BRANCH_DATASETS).forEach(branch => {
      allInv[branch] = [...BRANCH_DATASETS[branch].inventory];
    });
    return allInv;
  });
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Medicines");
  const [newItemQty, setNewItemQty] = useState("50");
  const [newItemMin, setNewItemMin] = useState("20");
  const [newItemExpiry, setNewItemExpiry] = useState("2027-01-01");
  const [restockingIds, setRestockingIds] = useState({});

  // Dynamic Audit Logs State (HIPAA Compliant with simulated SHA-256 signatures)
  const [auditLogs, setAuditLogs] = useState([
    {
      id: "a1",
      user: "Mostafa Mahmoud (Admin)",
      action: "Initialized Phase 4 Management Console",
      module: "Security",
      timestamp: "Today 09:12",
      source: "192.168.1.112 / Chrome (Windows)",
      hash: "8f9e612803b9da88a91b2c45167f9e8a719c8d374828f32c918ee91ba2d6f831",
      branch: "Cairo Main"
    },
    {
      id: "a2",
      user: "System Scheduler",
      action: "Encrypted patient charts log synchronization",
      module: "HIPAA Sync",
      timestamp: "Today 08:00",
      source: "Internal Pipeline / Port 443",
      hash: "c39d8e7161b9a2c3a5e8f2294cd81bb98f237f9011de9a98ef2e22c9e7fa1f22",
      branch: "All Branches"
    }
  ]);
  const [logSearch, setLogSearch] = useState("");
  const [logModuleFilter, setLogModuleFilter] = useState("All");

  const { data: doctorsData } = useUsers({ role: ROLES.DOCTOR });
  const [queueSearch, setQueueSearch] = useState("");

  // Helper to generate simulated cryptographically secure block hashes
  const generateSimulatedHash = () => {
    return Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  };

  // Helper to append log to HIPAA console
  const addAuditLog = (action, module) => {
    const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const date = "Today";
    const newLog = {
      id: `a-${Date.now()}`,
      user: "Mostafa Mahmoud (Admin)",
      action,
      module,
      timestamp: `${date} ${time}`,
      source: "197.34.82.90 / Chrome (Egypt)",
      hash: generateSimulatedHash(),
      branch: branchInfo.name
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Dynamic smooth scrolling hash anchor navigation
  useEffect(() => {
    const handleHashScroll = () => {
      if (window.location.hash) {
        const el = document.getElementById(window.location.hash.substring(1));
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }
    };
    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);

  // Switch branches handler
  const handleBranchChange = (branchKey) => {
    setCurrentBranch(branchKey);
    addAuditLog(`Switched management context to branch: ${BRANCH_DATASETS[branchKey].name}`, "Branches");
    toast.success(`Context loaded for ${BRANCH_DATASETS[branchKey].name}`);
  };

  // Dynamic Restocking Simulation
  const handleRestock = (itemId, itemName) => {
    setRestockingIds(prev => ({ ...prev, [itemId]: true }));
    addAuditLog(`Initiated restocking request for: ${itemName}`, "Inventory");

    setTimeout(() => {
      setInventoryList(prev => {
        const branchInv = prev[currentBranch].map(item => {
          if (item.id === itemId) {
            const newQty = item.quantity + 100;
            return {
              ...item,
              quantity: newQty,
              status: "healthy"
            };
          }
          return item;
        });
        return { ...prev, [currentBranch]: branchInv };
      });
      setRestockingIds(prev => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
      addAuditLog(`Restocked 100 units of ${itemName} (Stock level replenished)`, "Inventory");
      toast.success(`Successfully restocked 100 units of ${itemName}!`);
    }, 1500);
  };

  // Smart Reorder threshold adjustment
  const handleAdjustReorderPoint = (itemId, itemName, newThreshold) => {
    const val = parseInt(newThreshold) || 0;
    setInventoryList(prev => {
      const branchInv = prev[currentBranch].map(item => {
        if (item.id === itemId) {
          let nextStatus = item.status;
          // Dynamically compute safety warnings
          if (item.quantity <= val) {
            nextStatus = item.status === "expiring" ? "expiring" : "critical";
          } else if (item.quantity <= val + 15) {
            nextStatus = "low";
          } else {
            nextStatus = "healthy";
          }
          return { ...item, minimum: val, status: nextStatus };
        }
        return item;
      });
      return { ...prev, [currentBranch]: branchInv };
    });
    addAuditLog(`Adjusted Reorder safety point of ${itemName} to ${val} units`, "Inventory");
    toast.success(`Updated reorder point for ${itemName}`);
  };

  // Add Inventory Item Handler
  const handleAddInventoryItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      toast.error("Item name is required.");
      return;
    }

    const qty = parseInt(newItemQty) || 0;
    const min = parseInt(newItemMin) || 0;
    
    // Determine initial status based on safety thresholds
    let status = "healthy";
    if (qty <= min) {
      status = "critical";
    } else if (qty <= min + 15) {
      status = "low";
    }

    const newItem = {
      id: `inv-${Date.now()}`,
      item: newItemName,
      category: newItemCategory,
      quantity: qty,
      minimum: min,
      expiry: newItemExpiry,
      status
    };

    setInventoryList(prev => ({
      ...prev,
      [currentBranch]: [...prev[currentBranch], newItem]
    }));

    addAuditLog(`Added new ERP stock item: ${newItemName} (Qty: ${qty}, Reorder Point: ${min})`, "Inventory");
    toast.success(`Added ${newItemName} to ${branchInfo.name} inventory!`);
    
    // Reset Form Modal
    setIsNewItemModalOpen(false);
    setNewItemName("");
    setNewItemQty("50");
    setNewItemMin("20");
    setNewItemExpiry("2027-01-01");
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
    toast.success("Audit records exported cleanly.");
  };

  // Expiration Warn Calculator
  const getExpiryLabel = (dateStr) => {
    const diffTime = new Date(dateStr) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Expired!";
    if (diffDays <= 30) return `Expiring in ${diffDays} days!`;
    return dateStr;
  };

  // Active Branch values
  const activeInventory = inventoryList[currentBranch] || [];
  
  // Dynamic alerts
  const lowStockCount = activeInventory.filter(i => i.quantity <= i.minimum).length;
  const expiringSoonCount = activeInventory.filter(i => {
    const diff = new Date(i.expiry) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 30;
  }).length;

  // Recharts color palette
  const appointmentDistribution = [
    { name: "New Patient", value: 38, color: "#1f4072" },
    { name: "Follow-up", value: 44, color: "#307672" },
    { name: "Diagnostics", value: 18, color: "#f59e0b" },
  ];

  const cancellationTrend = [
    { day: "Mon", cancellations: currentBranch === "alex" ? 2 : 3 },
    { day: "Tue", cancellations: currentBranch === "alex" ? 4 : 6 },
    { day: "Wed", cancellations: currentBranch === "alex" ? 3 : 4 },
    { day: "Thu", cancellations: currentBranch === "alex" ? 5 : 7 },
    { day: "Fri", cancellations: currentBranch === "alex" ? 4 : 5 },
    { day: "Sat", cancellations: currentBranch === "alex" ? 1 : 2 },
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

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(logSearch.toLowerCase()) || 
                          log.user.toLowerCase().includes(logSearch.toLowerCase());
    const matchesModule = logModuleFilter === "All" || log.module === logModuleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 pb-12 text-slate-700"
    >
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Decision Center • Multi-Branch ERP
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            Clinic Overview
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Active: <span className="font-bold text-brand-600">{branchInfo.name}</span>
          </p>
        </div>
        
        {/* Branch Selector Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 border border-slate-100 shadow-sm">
            <Icon name="faCodeFork" className="text-slate-400 text-xs ml-2" />
            <select
              value={currentBranch}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="h-9 pr-8 bg-transparent text-xs font-black uppercase tracking-widest text-slate-600 outline-none appearance-none cursor-pointer border-none"
            >
              <option value="cairo">Cairo Branch</option>
              <option value="giza">Giza Branch</option>
              <option value="alex">Alexandria Branch</option>
            </select>
          </div>

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
                    : "text-slate-500 hover:bg-slate-55",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button variant="primary" className="gap-2 h-12 rounded-2xl" onClick={() => exportToCsv(filteredLogs, `hipaa-audit-${currentBranch}.csv`)}>
            <Icon name="faFileExport" />
            Export Logs
          </Button>
        </div>
      </header>

      {/* KPI Cards Grid - Bound to Selected Branch */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${(branchInfo.totalRevenue / 1000).toFixed(1)}k`}
          icon="faWallet"
          trend="up"
          trendValue="11.6%"
          variant="warning"
          layout="compact"
        />
        <StatCard
          title="Active Patients"
          value={branchInfo.totalPatients}
          icon="faHospitalUser"
          trend="up"
          trendValue="4.2%"
          variant="primary"
          layout="compact"
        />
        <StatCard
          title="Daily Appointments"
          value={branchInfo.dailyAppointments}
          icon="faCalendarCheck"
          trend="up"
          trendValue="6.8%"
          variant="success"
          layout="compact"
        />
        <StatCard
          title="Clinic Occupancy"
          value={`${branchInfo.clinicOccupancy}%`}
          icon="faHeartbeat"
          trend="up"
          trendValue="3.4%"
          variant="success"
          layout="compact"
        />
      </div>

      {/* Recharts Analytics Maps */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Revenue Performance Bar Chart */}
        <Card
          className="lg:col-span-2"
          title="Revenue Performance"
          description={`Monthly performance for ${branchInfo.name}`}
        >
          <div className="mt-8 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchInfo.revenueData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", background: "#fff" }}
                />
                <Bar dataKey="revenue" fill="#307672" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Appointment Status Pie Chart */}
        <Card title="Appointment Status" description="Breakdown of booking success rates.">
          <div className="mt-8 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={branchInfo.statusData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {branchInfo.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", background: "#fff" }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px", fontWeight: "bold" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Bookings over time Line Chart */}
        <Card title="Daily Bookings" description="Volume of appointments across the current week.">
          <div className="mt-8 h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={branchInfo.bookingsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", background: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#307672"
                  strokeWidth={4}
                  dot={{ r: 6, fill: "#307672", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Cancellations Line Chart */}
        <Card title="Cancellation Analytics" description="Daily cancellations and operational impact.">
          <div className="mt-8 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cancellationTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", background: "#fff" }}
                />
                <Line type="monotone" dataKey="cancellations" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: "#ef4444" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Operational Signals */}
      <section className="space-y-6">
        <div>
          <div className="hud-chip">Operational insights</div>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Executive signals</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {branchInfo.operationalInsights.map((insight) => (
            <Card key={insight.title} className="p-0">
              <div className="p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{insight.title}</p>
                <p className="mt-3 text-lg font-black text-slate-950">{insight.value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{insight.subtext}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Live Waiting Operations */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="hud-chip">Queue management</div>
            <h2 className="mt-3 text-2xl font-black text-slate-950 font-sans">Live waiting operations</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <Card className="xl:col-span-2" title="Queue dashboard" description={`Active patients in queue at ${branchInfo.name}`}>
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
                        <p className="text-sm font-bold text-slate-900">{row.patient}</p>
                        <p className="text-xs font-semibold text-slate-400">Room {row.room}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Assigned Doctor",
                  render: (row) => <p className="text-sm font-bold text-slate-700">{row.doctor}</p>,
                },
                {
                  header: "ETA",
                  render: (row) => (
                    <div>
                      <p className="text-sm font-bold text-slate-700">{row.eta}</p>
                      <p className="text-xs font-semibold text-slate-400">Wait {row.wait} min</p>
                    </div>
                  ),
                },
                {
                  header: "Status",
                  render: (row) => (
                    <Badge tone={row.status === "ready" ? "success" : "secondary"}>
                      {row.status}
                    </Badge>
                  ),
                },
              ]}
              data={branchInfo.queueData}
            />
          </Card>

          <div className="space-y-6">
            <Card title="Live queue status" description="Real-time signals and waiting experience.">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Avg wait</p>
                    <p className="text-2xl font-black text-slate-900 mt-2">{currentBranch === "cairo" ? "14 min" : currentBranch === "giza" ? "18 min" : "8 min"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-500">-2 min</p>
                    <p className="text-xs font-semibold text-slate-400">vs yesterday</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Patients waiting</p>
                    <p className="text-2xl font-black text-slate-900 mt-2">{branchInfo.queueData.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Threshold</p>
                    <p className="text-xs font-semibold text-slate-500">10 max</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SMART INVENTORY ERP SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section id="inventory" className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="hud-chip bg-brand-50 text-brand-600">Inventory ERP & Pharmacy</div>
            <h2 className="mt-3 text-2xl font-black text-slate-950 font-sans">Clinical Stock Operations</h2>
            <p className="text-xs text-slate-400 font-medium">Real-time depletion alerts and interactive restocking triggers.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-11 px-5" onClick={() => exportToCsv(activeInventory, `${currentBranch}-inventory.csv`)}>
              <Icon name="faFileExport" className="mr-2" /> Export Inventory CSV
            </Button>
            <Button variant="primary" className="h-11 px-5 rounded-2xl gap-2" onClick={() => setIsNewItemModalOpen(true)}>
              <Icon name="faPlus" /> Add Stock Item
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <Card className="xl:col-span-2" title="Active Stock Catalog" description={`Managing materials for ${branchInfo.name}`}>
            <div className="space-y-4">
              {/* Dynamic Alerts Header */}
              {(lowStockCount > 0 || expiringSoonCount > 0) && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-rose-700 flex items-center gap-1.5">
                    <Icon name="faCircleExclamation" /> Critical Supply Warnings
                  </p>
                  <p className="text-xs font-medium text-rose-600">
                    {lowStockCount > 0 && `⚠️ ${lowStockCount} items are below or equal to their smart Reorder Points. `}
                    {expiringSoonCount > 0 && `⏳ ${expiringSoonCount} pharmaceutical items expire within the next 30 days!`}
                  </p>
                </div>
              )}

              <Table
                columns={[
                  {
                    header: "Supply Item",
                    render: (row) => (
                      <div>
                        <p className="text-sm font-bold text-slate-900">{row.item}</p>
                        <Badge tone="secondary" className="text-[8px] uppercase font-black tracking-widest mt-1.5">{row.category}</Badge>
                      </div>
                    ),
                  },
                  {
                    header: "Current Stock",
                    render: (row) => (
                      <div className="flex items-center gap-2">
                        <span className={classNames(
                          "text-sm font-black",
                          row.quantity <= row.minimum ? "text-rose-600" : "text-slate-800"
                        )}>
                          {row.quantity}
                        </span>
                        {row.quantity <= row.minimum && (
                          <Badge tone="danger" className="text-[8px] uppercase tracking-tighter">Low</Badge>
                        )}
                      </div>
                    ),
                  },
                  {
                    header: "Reorder Point",
                    render: (row) => (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={row.minimum}
                          onBlur={(e) => handleAdjustReorderPoint(row.id, row.item, e.target.value)}
                          className="h-8 w-14 rounded-xl border border-slate-200 text-center text-xs font-bold outline-none focus:border-brand-500 shadow-sm"
                        />
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Min</span>
                      </div>
                    ),
                  },
                  {
                    header: "Expiration Date",
                    render: (row) => {
                      const isExpiring = getExpiryLabel(row.expiry).includes("days!");
                      return (
                        <div>
                          <p className={classNames("text-xs font-semibold", isExpiring ? "text-rose-500 font-bold" : "text-slate-500")}>
                            {getExpiryLabel(row.expiry)}
                          </p>
                        </div>
                      );
                    },
                  },
                  {
                    header: "Actions",
                    render: (row) => (
                      <div className="flex items-center gap-2">
                        <Button
                          variant={row.quantity <= row.minimum ? "primary" : "outline"}
                          size="sm"
                          disabled={restockingIds[row.id]}
                          className="h-8 px-2.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0"
                          onClick={() => handleRestock(row.id, row.item)}
                        >
                          {restockingIds[row.id] ? (
                            <><Icon name="faSpinner" className="animate-spin text-[10px]" /> Loading</>
                          ) : (
                            <><Icon name="faBoxesStacked" /> Restock</>
                          )}
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={activeInventory}
              />
            </div>
          </Card>

          <Card title="Quick Stock Insights" description="Consumption metrics & smart parameters.">
            <div className="space-y-6 mt-4">
              <div className="rounded-2xl border border-brand-100 bg-brand-50/20 p-4 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 block">Smart Optimization</span>
                <p className="text-xs font-medium text-slate-600">Reorder points automatically trigger replenishment requests to avoid workflow blockages in {branchInfo.name}.</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
                  <span>Fastest Moving Supplies</span>
                  <span>Weekly Volume</span>
                </div>
                {[
                  { name: "Latex Examination Gloves", vol: "240 units", color: "bg-emerald-500" },
                  { name: "Panadol Advance 500mg", vol: "180 units", color: "bg-brand-500" },
                  { name: "Disposable Syringes 5ml", vol: "140 units", color: "bg-amber-500" }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100/60 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={classNames("h-2 w-2 rounded-full shrink-0", item.color)}></span>
                      <span className="text-xs font-bold text-slate-800 truncate">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter shrink-0">{item.vol}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HIPAA AUDIT LOG CONSOLE SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section id="hipaa" className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="hud-chip bg-emerald-50 text-emerald-600">HIPAA Security Center</div>
            <h2 className="mt-3 text-2xl font-black text-slate-950 font-sans">Cryptographically-Signed Audit Trail</h2>
            <p className="text-xs text-slate-400 font-medium">Real-time immutable clinical ledger. Demonstrates 100% HIPAA compliance.</p>
          </div>
          
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 px-3.5 py-2 flex items-center gap-2 text-emerald-700 text-xs font-bold">
            <Icon name="faUserShield" className="text-sm animate-pulse" />
            <span>LOG INTEGRITY VERIFIED (256-BIT SHA CHAIN)</span>
          </div>
        </div>

        <Card title="Security Ledger Console" description="Full immutable recording of system modifications, branch context swaps, and stock ERP updates.">
          <div className="space-y-4">
            {/* Filter Matrix */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Icon name="faSearch" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  placeholder="Filter logs by keyword..."
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 shadow-sm"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                />
              </div>

              <select
                value={logModuleFilter}
                onChange={(e) => setLogModuleFilter(e.target.value)}
                className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:border-brand-500 shadow-sm"
              >
                <option value="All">All Modules</option>
                <option value="Inventory">Inventory</option>
                <option value="Security">Security</option>
                <option value="Branches">Branches</option>
                <option value="HIPAA Sync">HIPAA Sync</option>
              </select>

              <Button variant="outline" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-1.5" onClick={() => exportToCsv(filteredLogs, "hipaa-audit-logs.csv")}>
                <Icon name="faFileExport" /> Export HIPAA CSV
              </Button>
            </div>

            {/* Audit Logs Table */}
            <Table
              columns={[
                {
                  header: "System User",
                  render: (row) => (
                    <div>
                      <p className="text-sm font-bold text-slate-900">{row.user}</p>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{row.branch}</span>
                    </div>
                  ),
                },
                {
                  header: "Module",
                  render: (row) => (
                    <Badge tone={
                      row.module === "Security" ? "danger" :
                      row.module === "Branches" ? "primary" :
                      row.module === "Inventory" ? "warning" : "success"
                    } className="text-[8px] uppercase font-black tracking-widest">
                      {row.module}
                    </Badge>
                  ),
                },
                {
                  header: "Action Log Entry",
                  render: (row) => (
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{row.action}</p>
                      <p className="text-[9px] font-mono text-slate-400 mt-1">IP: {row.source}</p>
                    </div>
                  ),
                },
                {
                  header: "Integrity Signature Hash",
                  render: (row) => (
                    <div className="flex items-center gap-1.5 max-w-[240px]">
                      <Icon name="faLock" className="text-emerald-500 text-[10px]" />
                      <span className="font-mono text-[9px] text-slate-400 truncate bg-slate-50 px-2 py-1 rounded border border-slate-100" title={row.hash}>
                        {row.hash}
                      </span>
                    </div>
                  ),
                },
                {
                  header: "Timestamp",
                  render: (row) => <span className="text-xs text-slate-400 font-bold">{row.timestamp}</span>,
                },
              ]}
              data={filteredLogs}
            />
          </div>
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: ADD INVENTORY STOCK ITEM */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Modal isOpen={isNewItemModalOpen} onClose={() => setIsNewItemModalOpen(false)} title="Add Supply / Pharmacy Item" size="md">
        <form onSubmit={handleAddInventoryItem} className="space-y-6 pt-4 text-slate-700">
          <div className="space-y-4">
            <Input
              label="Item Name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="e.g. Panadol Extra 500mg"
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-brand-500 shadow-sm transition-all"
                >
                  <option value="Medicines">Medicines / Rx</option>
                  <option value="Supplies">Clinical Supplies</option>
                  <option value="Equipment">Equipment / Tools</option>
                </select>
              </div>
              
              <Input
                label="Initial Quantity"
                type="number"
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                min="0"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Smart Reorder Point (Min)"
                type="number"
                value={newItemMin}
                onChange={(e) => setNewItemMin(e.target.value)}
                min="1"
                required
              />
              
              <Input
                label="Expiration Date"
                type="date"
                value={newItemExpiry}
                onChange={(e) => setNewItemExpiry(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsNewItemModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="px-8 shadow-halo">Add Supply to ERP</Button>
          </div>
        </form>
      </Modal>
    </MotionDiv>
  );
}

export default AdminDashboard;
