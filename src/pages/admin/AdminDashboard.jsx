import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import StatCard from "@/features/dashboard/StatCard";
import { Card, Icon, Button, Badge, Table, Modal, Input } from "@/components";
import { motion } from "framer-motion";
import { classNames } from "@/utils";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
const MotionDiv = motion.div;
const HASH_GENESIS = "0000000000000000000000000000000000000000000000000000000000000000";
function generateSimulatedHash(seed) {
  let state = 2166136261;
  const source = String(seed || "clinic-ledger");
  for (let i = 0; i < source.length; i += 1) {
    state ^= source.charCodeAt(i);
    state = Math.imul(state, 16777619);
  }
  let hash = "";
  for (let i = 0; i < 8; i += 1) {
    state ^= i + source.length;
    state = Math.imul(state, 16777619);
    hash += (state >>> 0).toString(16).padStart(8, "0");
  }
  return hash;
}

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
    operationalInsights: [{
      title: "Most booked doctor",
      value: "Dr. Ahmed Mansour",
      subtext: "Cardiologist",
      tone: "primary"
    }, {
      title: "Highest cancellation period",
      value: "Tue 2-4 PM",
      subtext: "2% cancel rate",
      tone: "danger"
    }, {
      title: "Busiest clinic hours",
      value: "10:00 - 12:00",
      subtext: "Avg 22 check-ins",
      tone: "success"
    }, {
      title: "Low occupancy alert",
      value: "Saturday",
      subtext: "Occupancy 38%",
      tone: "warning"
    }],
    revenueData: [{
      month: "Jan",
      revenue: 42000
    }, {
      month: "Feb",
      revenue: 45000
    }, {
      month: "Mar",
      revenue: 48000
    }, {
      month: "Apr",
      revenue: 52000
    }, {
      month: "May",
      revenue: 58000
    }, {
      month: "Jun",
      revenue: 61000
    }],
    statusData: [{
      name: "Confirmed",
      value: 85,
      color: "#10b981"
    }, {
      name: "Pending",
      value: 12,
      color: "#f59e0b"
    }, {
      name: "Cancelled",
      value: 3,
      color: "#ef4444"
    }],
    bookingsData: [{
      day: "Mon",
      bookings: 78
    }, {
      day: "Tue",
      bookings: 84
    }, {
      day: "Wed",
      bookings: 80
    }, {
      day: "Thu",
      bookings: 88
    }, {
      day: "Fri",
      bookings: 92
    }, {
      day: "Sat",
      bookings: 32
    }, {
      day: "Sun",
      bookings: 12
    }],
    topDoctors: [{
      name: "Dr. Ahmed Mansour",
      appointments: 142,
      rating: 4.9
    }, {
      name: "Dr. Layla Hassan",
      appointments: 118,
      rating: 4.8
    }, {
      name: "Dr. Fatima Al-Zahra",
      appointments: 96,
      rating: 4.7
    }],
    queueData: [{
      id: "q1",
      position: 1,
      patient: "Hala Mohammed",
      doctor: "Dr. Ahmed Mansour",
      eta: "5 min",
      status: "ready",
      room: "A2",
      wait: 8
    }, {
      id: "q2",
      position: 2,
      patient: "Mariam Ali",
      doctor: "Dr. Layla Hassan",
      eta: "12 min",
      status: "waiting",
      room: "B1",
      wait: 14
    }, {
      id: "q3",
      position: 3,
      patient: "Khaled El-Sayed",
      doctor: "Dr. Ahmed Mansour",
      eta: "18 min",
      status: "waiting",
      room: "A2",
      wait: 20
    }],
    inventory: [{
      id: "inv-c1",
      item: "Amoxicillin 500mg",
      category: "Medicines",
      quantity: 12,
      minimum: 30,
      expiry: "2026-06-25",
      status: "low"
    }, {
      id: "inv-c2",
      item: "Latex Sterile Gloves",
      category: "Supplies",
      quantity: 320,
      minimum: 150,
      expiry: "2027-05-11",
      status: "healthy"
    }, {
      id: "inv-c3",
      item: "Ultrasound Gel",
      category: "Supplies",
      quantity: 18,
      minimum: 40,
      expiry: "2026-07-02",
      status: "critical"
    }, {
      id: "inv-c4",
      item: "ECG Lead Wires",
      category: "Equipment",
      quantity: 9,
      minimum: 8,
      expiry: "2028-12-01",
      status: "healthy"
    }]
  },
  giza: {
    name: "Giza Clinic (Sheikh Zayed)",
    totalRevenue: 192200,
    dailyAppointments: 68,
    cancellationRate: "4.8",
    totalPatients: 980,
    clinicOccupancy: 64,
    performanceScore: "4.7/5",
    operationalInsights: [{
      title: "Most booked doctor",
      value: "Dr. Layla Hassan",
      subtext: "Neurologist",
      tone: "primary"
    }, {
      title: "Highest cancellation period",
      value: "Wed 4-6 PM",
      subtext: "8% cancel rate",
      tone: "danger"
    }, {
      title: "Busiest clinic hours",
      value: "14:00 - 16:00",
      subtext: "Avg 18 check-ins",
      tone: "success"
    }, {
      title: "Low occupancy alert",
      value: "Friday",
      subtext: "Occupancy 20%",
      tone: "warning"
    }],
    revenueData: [{
      month: "Jan",
      revenue: 30000
    }, {
      month: "Feb",
      revenue: 32000
    }, {
      month: "Mar",
      revenue: 35000
    }, {
      month: "Apr",
      revenue: 38000
    }, {
      month: "May",
      revenue: 41000
    }, {
      month: "Jun",
      revenue: 46200
    }],
    statusData: [{
      name: "Confirmed",
      value: 78,
      color: "#10b981"
    }, {
      name: "Pending",
      value: 16,
      color: "#f59e0b"
    }, {
      name: "Cancelled",
      value: 6,
      color: "#ef4444"
    }],
    bookingsData: [{
      day: "Mon",
      bookings: 55
    }, {
      day: "Tue",
      bookings: 62
    }, {
      day: "Wed",
      bookings: 58
    }, {
      day: "Thu",
      bookings: 64
    }, {
      day: "Fri",
      bookings: 20
    }, {
      day: "Sat",
      bookings: 48
    }, {
      day: "Sun",
      bookings: 8
    }],
    topDoctors: [{
      name: "Dr. Layla Hassan",
      appointments: 130,
      rating: 4.8
    }, {
      name: "Dr. Ahmed Mansour",
      appointments: 92,
      rating: 4.6
    }, {
      name: "Dr. Fatima Al-Zahra",
      appointments: 78,
      rating: 4.7
    }],
    queueData: [{
      id: "q4",
      position: 1,
      patient: "Youssef Ibrahim",
      doctor: "Dr. Fatima Al-Zahra",
      eta: "8 min",
      status: "ready",
      room: "C3",
      wait: 12
    }, {
      id: "q5",
      position: 2,
      patient: "Nour El-Din",
      doctor: "Dr. Layla Hassan",
      eta: "16 min",
      status: "waiting",
      room: "B1",
      wait: 18
    }],
    inventory: [{
      id: "inv-g1",
      item: "Panadol Advance 500mg",
      category: "Medicines",
      quantity: 8,
      minimum: 25,
      expiry: "2026-06-10",
      status: "critical"
    }, {
      id: "inv-g2",
      item: "Latex Sterile Gloves",
      category: "Supplies",
      quantity: 120,
      minimum: 150,
      expiry: "2027-02-14",
      status: "low"
    }, {
      id: "inv-g3",
      item: "Insulin Pens 100U",
      category: "Medicines",
      quantity: 42,
      minimum: 35,
      expiry: "2026-06-18",
      status: "expiring"
    }]
  },
  alex: {
    name: "Alexandria Coastal Branch",
    totalRevenue: 118400,
    dailyAppointments: 42,
    cancellationRate: "5.6",
    totalPatients: 540,
    clinicOccupancy: 48,
    performanceScore: "4.8/5",
    operationalInsights: [{
      title: "Most booked doctor",
      value: "Dr. Fatima Al-Zahra",
      subtext: "Pediatrician",
      tone: "primary"
    }, {
      title: "Highest cancellation period",
      value: "Mon 9-11 AM",
      subtext: "10% cancel rate",
      tone: "danger"
    }, {
      title: "Busiest clinic hours",
      value: "09:00 - 11:00",
      subtext: "Avg 12 check-ins",
      tone: "success"
    }, {
      title: "Low occupancy alert",
      value: "Wednesday",
      subtext: "Occupancy 15%",
      tone: "warning"
    }],
    revenueData: [{
      month: "Jan",
      revenue: 18000
    }, {
      month: "Feb",
      revenue: 19500
    }, {
      month: "Mar",
      revenue: 21000
    }, {
      month: "Apr",
      revenue: 22000
    }, {
      month: "May",
      revenue: 25000
    }, {
      month: "Jun",
      revenue: 28400
    }],
    statusData: [{
      name: "Confirmed",
      value: 74,
      color: "#10b981"
    }, {
      name: "Pending",
      value: 20,
      color: "#f59e0b"
    }, {
      name: "Cancelled",
      value: 6,
      color: "#ef4444"
    }],
    bookingsData: [{
      day: "Mon",
      bookings: 32
    }, {
      day: "Tue",
      bookings: 38
    }, {
      day: "Wed",
      bookings: 15
    }, {
      day: "Thu",
      bookings: 42
    }, {
      day: "Fri",
      bookings: 46
    }, {
      day: "Sat",
      bookings: 22
    }, {
      day: "Sun",
      bookings: 5
    }],
    topDoctors: [{
      name: "Dr. Fatima Al-Zahra",
      appointments: 112,
      rating: 4.8
    }, {
      name: "Dr. Ahmed Mansour",
      appointments: 52,
      rating: 4.7
    }, {
      name: "Dr. Layla Hassan",
      appointments: 40,
      rating: 4.5
    }],
    queueData: [{
      id: "q6",
      position: 1,
      patient: "Hoda Kotb",
      doctor: "Dr. Fatima Al-Zahra",
      eta: "4 min",
      status: "ready",
      room: "C3",
      wait: 6
    }],
    inventory: [{
      id: "inv-a1",
      item: "Amoxicillin 500mg",
      category: "Medicines",
      quantity: 6,
      minimum: 20,
      expiry: "2026-07-15",
      status: "critical"
    }, {
      id: "inv-a2",
      item: "ECG Electrodes 50pk",
      category: "Supplies",
      quantity: 3,
      minimum: 10,
      expiry: "2026-06-20",
      status: "critical"
    }, {
      id: "inv-a3",
      item: "Latex Sterile Gloves",
      category: "Supplies",
      quantity: 280,
      minimum: 100,
      expiry: "2027-11-20",
      status: "healthy"
    }]
  }
};
function AdminDashboard({
  view = "overview"
}) {
  const {
    t
  } = useTranslation();
  const [currentBranch, setCurrentBranch] = useState("cairo");
  const branchInfo = BRANCH_DATASETS[currentBranch];
  const isOverview = view === "overview";
  const isInventory = view === "inventory";
  const isHipaa = view === "hipaa";
  const pageMeta = {
    overview: {
      eyebrow: "Decision Center - Multi-Branch ERP",
      title: t("pages.admin.admindashboard.clinicOverview"),
      subtitle: t("pages.admin.admindashboard.enterprisePerformanceQueuesAndBranchLevelAnalytics")
    },
    inventory: {
      eyebrow: "Inventory ERP - Pharmacy & Supplies",
      title: t("pages.admin.admindashboard.inventoryErp"),
      subtitle: t("pages.admin.admindashboard.clinicalStockOperationsReorderPointsRestockingAnd")
    },
    hipaa: {
      eyebrow: "HIPAA Security Center",
      title: t("pages.admin.admindashboard.hipaaSecurityLogs"),
      subtitle: t("pages.admin.admindashboard.cryptographicallySignedAuditTrailForEnterpriseCompliance")
    }
  }[view] || {
    eyebrow: "Decision Center - Multi-Branch ERP",
    title: t("pages.admin.admindashboard.clinicOverview2"),
    subtitle: t("pages.admin.admindashboard.enterprisePerformanceQueuesAndBranchLevelAnalytics2")
  };

  // Filters state
  const [period, setPeriod] = useState("monthly");

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
  const [auditLogs, setAuditLogs] = useState([{
    id: "a1",
    user: "Mostafa Mahmoud (Admin)",
    action: "Initialized Phase 4 Management Console",
    module: "Security",
    timestamp: "Today 09:12",
    source: "192.168.1.112 / Chrome (Windows)",
    role: t("pages.admin.admindashboard.admin"),
    severity: "info",
    previousHash: "c39d8e7161b9a2c3a5e8f2294cd81bb98f237f9011de9a98ef2e22c9e7fa1f22",
    hash: "8f9e612803b9da88a91b2c45167f9e8a719c8d374828f32c918ee91ba2d6f831",
    branch: "Cairo Main"
  }, {
    id: "a2",
    user: "System Scheduler",
    action: "Encrypted patient charts log synchronization",
    module: "HIPAA Sync",
    timestamp: "Today 08:00",
    source: "Internal Pipeline / Port 443",
    role: t("pages.admin.admindashboard.system"),
    severity: "success",
    previousHash: HASH_GENESIS,
    hash: "c39d8e7161b9a2c3a5e8f2294cd81bb98f237f9011de9a98ef2e22c9e7fa1f22",
    branch: "All Branches"
  }]);
  const [logSearch, setLogSearch] = useState("");
  const [logModuleFilter, setLogModuleFilter] = useState("All");
  const [logRoleFilter, setLogRoleFilter] = useState("All");
  const [logSeverityFilter, setLogSeverityFilter] = useState("All");

  // Helper to append log to HIPAA console
  const addAuditLog = (action, module, options = {}) => {
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
    const date = "Today";
    const timestamp = `${date} ${time}`;
    const role = options.role || "Admin";
    const severity = options.severity || "info";
    const branch = options.branchName || branchInfo.name;
    const source = options.source || "197.34.82.90 / Chrome (Egypt)";
    setAuditLogs(prev => {
      const previousHash = prev[0]?.hash || HASH_GENESIS;
      const hash = generateSimulatedHash(`${previousHash}|${role}|${module}|${severity}|${action}|${branch}|${timestamp}|${source}`);
      const newLog = {
        id: `a-${Date.now()}`,
        user: options.user || "Mostafa Mahmoud (Admin)",
        role,
        severity,
        action,
        module,
        timestamp,
        source,
        previousHash,
        hash,
        branch
      };
      return [newLog, ...prev];
    });
  };

  // Dynamic smooth scrolling hash anchor navigation
  useEffect(() => {
    const handleHashScroll = () => {
      if (window.location.hash) {
        const el = document.getElementById(window.location.hash.substring(1));
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({
              behavior: "smooth"
            });
          }, 100);
        }
      }
    };
    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);

  // Switch branches handler
  const handleBranchChange = branchKey => {
    const nextBranch = BRANCH_DATASETS[branchKey];
    setCurrentBranch(branchKey);
    addAuditLog(`Switched management context to branch: ${nextBranch.name}`, "Branches", {
      branchName: nextBranch.name,
      severity: "info"
    });
    toast.success(t("pages.admin.admindashboard.contextLoadedForBranch", {
      branchName: nextBranch.name
    }));
  };

  // Dynamic Restocking Simulation
  const handleRestock = (itemId, itemName) => {
    const branchKey = currentBranch;
    const branchName = branchInfo.name;
    setRestockingIds(prev => ({
      ...prev,
      [itemId]: true
    }));
    addAuditLog(`Initiated restocking request for: ${itemName}`, "Inventory", {
      branchName,
      severity: "warning"
    });
    setTimeout(() => {
      setInventoryList(prev => {
        const branchInv = prev[branchKey].map(item => {
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
        return {
          ...prev,
          [branchKey]: branchInv
        };
      });
      setRestockingIds(prev => {
        const copy = {
          ...prev
        };
        delete copy[itemId];
        return copy;
      });
      addAuditLog(`Restocked 100 units of ${itemName} (Stock level replenished)`, "Inventory", {
        branchName,
        severity: "success"
      });
      toast.success(t("pages.admin.admindashboard.successfullyRestockedUnits", {
        count: 100,
        itemName
      }));
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
          return {
            ...item,
            minimum: val,
            status: nextStatus
          };
        }
        return item;
      });
      return {
        ...prev,
        [currentBranch]: branchInv
      };
    });
    addAuditLog(`Adjusted Reorder safety point of ${itemName} to ${val} units`, "Inventory", {
      severity: val > 0 ? "info" : "warning"
    });
    toast.success(t("pages.admin.admindashboard.updatedReorderPointForItem", {
      itemName
    }));
  };

  // Add Inventory Item Handler
  const handleAddInventoryItem = e => {
    e.preventDefault();
    if (!newItemName.trim()) {
      toast.error(t("pages.admin.admindashboard.itemNameIsRequired"));
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
    addAuditLog(`Added new ERP stock item: ${newItemName} (Qty: ${qty}, Reorder Point: ${min})`, "Inventory", {
      severity: status === "healthy" ? "success" : "warning"
    });
    toast.success(t("pages.admin.admindashboard.addedItemToBranchInventory", {
      itemName: newItemName,
      branchName: branchInfo.name
    }));

    // Reset Form Modal
    setIsNewItemModalOpen(false);
    setNewItemName("");
    setNewItemQty("50");
    setNewItemMin("20");
    setNewItemExpiry("2027-01-01");
  };
  const exportToCsv = (rows, filename) => {
    if (!rows || rows.length === 0) {
      toast.error(t("pages.admin.admindashboard.noDataAvailableToExport"));
      return;
    }
    const headers = Object.keys(rows[0]);
    const escapeValue = value => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    };
    const csv = [headers.join(","), ...rows.map(row => headers.map(header => escapeValue(row[header])).join(","))].join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("pages.admin.admindashboard.auditRecordsExportedCleanly"));
  };

  // Expiration Warn Calculator
  const getExpiryLabel = dateStr => {
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
  const cancellationTrend = [{
    day: "Mon",
    cancellations: currentBranch === "alex" ? 2 : 3
  }, {
    day: "Tue",
    cancellations: currentBranch === "alex" ? 4 : 6
  }, {
    day: "Wed",
    cancellations: currentBranch === "alex" ? 3 : 4
  }, {
    day: "Thu",
    cancellations: currentBranch === "alex" ? 5 : 7
  }, {
    day: "Fri",
    cancellations: currentBranch === "alex" ? 4 : 5
  }, {
    day: "Sat",
    cancellations: currentBranch === "alex" ? 1 : 2
  }, {
    day: "Sun",
    cancellations: 1
  }];
  const filteredLogs = auditLogs.filter(log => {
    const query = logSearch.toLowerCase();
    const matchesSearch = [log.action, log.user, log.source, log.hash, log.branch].some(value => String(value).toLowerCase().includes(query));
    const matchesModule = logModuleFilter === "All" || log.module === logModuleFilter;
    const matchesRole = logRoleFilter === "All" || log.role === logRoleFilter;
    const matchesSeverity = logSeverityFilter === "All" || log.severity === logSeverityFilter;
    return matchesSearch && matchesModule && matchesRole && matchesSeverity;
  });
  return <MotionDiv initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} className="space-y-10 pb-12 text-slate-700">
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {pageMeta.eyebrow}
            </span>
            <span className="hidden">{t("pages.admin.admindashboard.decisionCenterMultiBranchErp")}</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            {pageMeta.title}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {pageMeta.subtitle}{t("pages.admin.admindashboard.active")}<span className="font-bold text-brand-600">{branchInfo.name}</span>
          </p>
        </div>
        
        {/* Branch Selector Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 border border-slate-100 shadow-sm">
            <Icon name="faCodeFork" className="text-slate-400 text-xs ml-2" />
            <select value={currentBranch} onChange={e => handleBranchChange(e.target.value)} className="h-9 pr-8 bg-transparent text-xs font-black uppercase tracking-widest text-slate-600 outline-none appearance-none cursor-pointer border-none">
              <option value="cairo">{t("pages.admin.admindashboard.cairoBranch")}</option>
              <option value="giza">{t("pages.admin.admindashboard.gizaBranch")}</option>
              <option value="alex">{t("pages.admin.admindashboard.alexandriaBranch")}</option>
            </select>
          </div>

          {isOverview && <div className="flex items-center rounded-2xl bg-white p-1.5 border border-slate-100 shadow-sm">
            {[{
            label: t("pages.admin.admindashboard.daily"),
            value: "daily"
          }, {
            label: t("pages.admin.admindashboard.weekly"),
            value: "weekly"
          }, {
            label: t("pages.admin.admindashboard.monthly"),
            value: "monthly"
          }].map(option => <button key={option.value} onClick={() => setPeriod(option.value)} className={classNames("px-4 py-2 text-xs font-bold rounded-xl transition-all", period === option.value ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-50")}>
                {option.label}
              </button>)}
          </div>}
          {isHipaa && <Button variant="primary" className="gap-2 h-12 rounded-2xl" onClick={() => {
          addAuditLog("Exported HIPAA audit ledger snapshot", "Security", {
            severity: "info"
          });
          exportToCsv(filteredLogs, `hipaa-audit-${currentBranch}.csv`);
        }}>
            <Icon name="faFileExport" />{t("pages.admin.admindashboard.exportLogs")}</Button>}
        </div>
      </header>

      {isOverview && <>
      {/* KPI Cards Grid - Bound to Selected Branch */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("pages.admin.admindashboard.totalRevenue")} value={`$${(branchInfo.totalRevenue / 1000).toFixed(1)}k`} icon="faWallet" trend="up" trendValue="11.6%" variant="warning" layout="compact" />
        <StatCard title={t("pages.admin.admindashboard.activePatients")} value={branchInfo.totalPatients} icon="faHospitalUser" trend="up" trendValue="4.2%" variant="primary" layout="compact" />
        <StatCard title={t("pages.admin.admindashboard.dailyAppointments")} value={branchInfo.dailyAppointments} icon="faCalendarCheck" trend="up" trendValue="6.8%" variant="success" layout="compact" />
        <StatCard title={t("pages.admin.admindashboard.clinicOccupancy")} value={`${branchInfo.clinicOccupancy}%`} icon="faHeartbeat" trend="up" trendValue="3.4%" variant="success" layout="compact" />
      </div>

      {/* Recharts Analytics Maps */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Revenue Performance Bar Chart */}
        <Card className="lg:col-span-2" title={t("pages.admin.admindashboard.revenuePerformance")} description={`Monthly performance for ${branchInfo.name}`}>
          <div className="mt-8 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchInfo.revenueData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{
                  fill: "#94a3b8",
                  fontSize: 11,
                  fontWeight: 700
                }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{
                  fill: "#94a3b8",
                  fontSize: 11,
                  fontWeight: 700
                }} />
                <Tooltip contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                  background: "#fff"
                }} />
                <Bar dataKey="revenue" fill="#307672" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Appointment Status Pie Chart */}
        <Card title={t("pages.admin.admindashboard.appointmentStatus")} description="Breakdown of booking success rates.">
          <div className="mt-8 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={branchInfo.statusData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                  {branchInfo.statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  background: "#fff"
                }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{
                  fontSize: "12px",
                  fontWeight: "bold"
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Bookings over time Line Chart */}
        <Card title={t("pages.admin.admindashboard.dailyBookings")} description="Volume of appointments across the current week.">
          <div className="mt-8 h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={branchInfo.bookingsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{
                  fill: "#94a3b8",
                  fontSize: 11,
                  fontWeight: 700
                }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{
                  fill: "#94a3b8",
                  fontSize: 11,
                  fontWeight: 700
                }} />
                <Tooltip contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                  background: "#fff"
                }} />
                <Line type="monotone" dataKey="bookings" stroke="#307672" strokeWidth={4} dot={{
                  r: 6,
                  fill: "#307672",
                  strokeWidth: 2,
                  stroke: "#fff"
                }} activeDot={{
                  r: 8,
                  strokeWidth: 0
                }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Cancellations Line Chart */}
        <Card title={t("pages.admin.admindashboard.cancellationAnalytics")} description="Daily cancellations and operational impact.">
          <div className="mt-8 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cancellationTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{
                  fill: "#94a3b8",
                  fontSize: 11,
                  fontWeight: 700
                }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{
                  fill: "#94a3b8",
                  fontSize: 11,
                  fontWeight: 700
                }} />
                <Tooltip contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                  background: "#fff"
                }} />
                <Line type="monotone" dataKey="cancellations" stroke="#ef4444" strokeWidth={3} dot={{
                  r: 4,
                  fill: "#ef4444"
                }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Operational Signals */}
      <section className="space-y-6">
        <div>
          <div className="hud-chip">{t("pages.admin.admindashboard.operationalInsights")}</div>
          <h2 className="mt-3 text-2xl font-black text-slate-950">{t("pages.admin.admindashboard.executiveSignals")}</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {branchInfo.operationalInsights.map(insight => <Card key={insight.title} className="p-0">
              <div className="p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{insight.title}</p>
                <p className="mt-3 text-lg font-black text-slate-950">{insight.value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{insight.subtext}</p>
              </div>
            </Card>)}
        </div>
      </section>

      {/* Live Waiting Operations */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="hud-chip">{t("pages.admin.admindashboard.queueManagement")}</div>
            <h2 className="mt-3 text-2xl font-black text-slate-950 font-sans">{t("pages.admin.admindashboard.liveWaitingOperations")}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <Card className="xl:col-span-2" title={t("pages.admin.admindashboard.queueDashboard")} description={`Active patients in queue at ${branchInfo.name}`}>
            <Table columns={[{
              header: t("pages.admin.admindashboard.queue"),
              render: row => <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-700">
                        {row.position}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{row.patient}</p>
                        <p className="text-xs font-semibold text-slate-400">{t("pages.admin.admindashboard.room")}{row.room}</p>
                      </div>
                    </div>
            }, {
              header: t("pages.admin.admindashboard.assignedDoctor"),
              render: row => <p className="text-sm font-bold text-slate-700">{row.doctor}</p>
            }, {
              header: "ETA",
              render: row => <div>
                      <p className="text-sm font-bold text-slate-700">{row.eta}</p>
                      <p className="text-xs font-semibold text-slate-400">{t("pages.admin.admindashboard.wait")}{row.wait}{t("pages.admin.admindashboard.min")}</p>
                    </div>
            }, {
              header: t("pages.admin.admindashboard.status"),
              render: row => <Badge tone={row.status === "ready" ? "success" : "secondary"}>
                      {row.status}
                    </Badge>
            }]} data={branchInfo.queueData} />
          </Card>

          <div className="space-y-6">
            <Card title={t("pages.admin.admindashboard.liveQueueStatus")} description="Real-time signals and waiting experience.">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t("pages.admin.admindashboard.avgWait")}</p>
                    <p className="text-2xl font-black text-slate-900 mt-2">{currentBranch === "cairo" ? "14 min" : currentBranch === "giza" ? "18 min" : "8 min"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-500">{t("pages.admin.admindashboard.2Min")}</p>
                    <p className="text-xs font-semibold text-slate-400">{t("pages.admin.admindashboard.vsYesterday")}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t("pages.admin.admindashboard.patientsWaiting")}</p>
                    <p className="text-2xl font-black text-slate-900 mt-2">{branchInfo.queueData.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t("pages.admin.admindashboard.threshold")}</p>
                    <p className="text-xs font-semibold text-slate-500">{t("pages.admin.admindashboard.10Max")}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      </>}

      {/* SMART INVENTORY ERP SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isInventory && <section id="inventory" className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="hud-chip bg-brand-50 text-brand-600">{t("pages.admin.admindashboard.inventoryErpPharmacy")}</div>
            <h2 className="mt-3 text-2xl font-black text-slate-950 font-sans">{t("pages.admin.admindashboard.clinicalStockOperations")}</h2>
            <p className="text-xs text-slate-400 font-medium">{t("pages.admin.admindashboard.realTimeDepletionAlertsAndInteractiveRestocking")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-11 px-5" onClick={() => {
            addAuditLog("Exported branch inventory CSV snapshot", "Inventory", {
              severity: "info"
            });
            exportToCsv(activeInventory, `${currentBranch}-inventory.csv`);
          }}>
              <Icon name="faFileExport" className="mr-2" />{t("pages.admin.admindashboard.exportInventoryCsv")}</Button>
            <Button variant="primary" className="h-11 px-5 rounded-2xl gap-2" onClick={() => setIsNewItemModalOpen(true)}>
              <Icon name="faPlus" />{t("pages.admin.admindashboard.addStockItem")}</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <Card className="xl:col-span-2" title={t("pages.admin.admindashboard.activeStockCatalog")} description={`Managing materials for ${branchInfo.name}`}>
            <div className="space-y-4">
              {/* Dynamic Alerts Header */}
              {(lowStockCount > 0 || expiringSoonCount > 0) && <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-rose-700 flex items-center gap-1.5">
                    <Icon name="faCircleExclamation" />{t("pages.admin.admindashboard.criticalSupplyWarnings")}</p>
                  <p className="text-xs font-medium text-rose-600">
                    {lowStockCount > 0 && `Warning: ${lowStockCount} items are below or equal to their smart Reorder Points. `}
                    {expiringSoonCount > 0 && `Expiry: ${expiringSoonCount} pharmaceutical items expire within the next 30 days.`}
                  </p>
                </div>}

              <Table columns={[{
              header: t("pages.admin.admindashboard.supplyItem"),
              render: row => <div>
                        <p className="text-sm font-bold text-slate-900">{row.item}</p>
                        <Badge tone="secondary" className="text-[8px] uppercase font-black tracking-widest mt-1.5">{row.category}</Badge>
                      </div>
            }, {
              header: t("pages.admin.admindashboard.currentStock"),
              render: row => <div className="flex items-center gap-2">
                        <span className={classNames("text-sm font-black", row.quantity <= row.minimum ? "text-rose-600" : "text-slate-800")}>
                          {row.quantity}
                        </span>
                        {row.quantity <= row.minimum && <Badge tone="danger" className="text-[8px] uppercase tracking-tighter">{t("pages.admin.admindashboard.low")}</Badge>}
                      </div>
            }, {
              header: t("pages.admin.admindashboard.reorderPoint"),
              render: row => <div className="flex items-center gap-2">
                        <input type="number" defaultValue={row.minimum} onBlur={e => handleAdjustReorderPoint(row.id, row.item, e.target.value)} className="h-8 w-14 rounded-xl border border-slate-200 text-center text-xs font-bold outline-none focus:border-brand-500 shadow-sm" />
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{t("pages.admin.admindashboard.min2")}</span>
                      </div>
            }, {
              header: t("pages.admin.admindashboard.expirationDate"),
              render: row => {
                const isExpiring = getExpiryLabel(row.expiry).includes("days!");
                return <div className="space-y-1.5">
                          <p className={classNames("text-xs font-semibold", isExpiring ? "text-rose-500 font-bold" : "text-slate-500")}>
                            {getExpiryLabel(row.expiry)}
                          </p>
                          {isExpiring && <Badge tone="danger" className="text-[8px] uppercase tracking-widest">{t("pages.admin.admindashboard.nearExpiry")}</Badge>}
                        </div>;
              }
            }, {
              header: t("pages.admin.admindashboard.actions"),
              render: row => <div className="flex items-center gap-2">
                        <Button variant={row.quantity <= row.minimum ? "primary" : "outline"} size="sm" disabled={restockingIds[row.id]} className="h-8 px-2.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0" onClick={() => handleRestock(row.id, row.item)}>
                          {restockingIds[row.id] ? <><Icon name="faSpinner" className="animate-spin text-[10px]" />{t("pages.admin.admindashboard.loading")}</> : <><Icon name="faBoxesStacked" />{t("pages.admin.admindashboard.restock")}</>}
                        </Button>
                      </div>
            }]} data={activeInventory} />
            </div>
          </Card>

          <Card title={t("pages.admin.admindashboard.quickStockInsights")} description="Consumption metrics & smart parameters.">
            <div className="space-y-6 mt-4">
              <div className="rounded-2xl border border-brand-100 bg-brand-50/20 p-4 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 block">{t("pages.admin.admindashboard.smartOptimization")}</span>
                <p className="text-xs font-medium text-slate-600">{t("pages.admin.admindashboard.reorderPointsAutomaticallyTriggerReplenishmentRequestsTo")}{branchInfo.name}.</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
                  <span>{t("pages.admin.admindashboard.fastestMovingSupplies")}</span>
                  <span>{t("pages.admin.admindashboard.weeklyVolume")}</span>
                </div>
                {[{
                name: "Latex Examination Gloves",
                vol: "240 units",
                color: "bg-emerald-500"
              }, {
                name: "Panadol Advance 500mg",
                vol: "180 units",
                color: "bg-brand-500"
              }, {
                name: "Disposable Syringes 5ml",
                vol: "140 units",
                color: "bg-amber-500"
              }].map((item, idx) => <div key={idx} className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100/60 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={classNames("h-2 w-2 rounded-full shrink-0", item.color)}></span>
                      <span className="text-xs font-bold text-slate-800 truncate">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter shrink-0">{item.vol}</span>
                  </div>)}
              </div>
            </div>
          </Card>
        </div>
      </section>}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HIPAA AUDIT LOG CONSOLE SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isHipaa && <section id="hipaa" className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="hud-chip bg-emerald-50 text-emerald-600">{t("pages.admin.admindashboard.hipaaSecurityCenter")}</div>
            <h2 className="mt-3 text-2xl font-black text-slate-950 font-sans">{t("pages.admin.admindashboard.cryptographicallySignedAuditTrail")}</h2>
            <p className="text-xs text-slate-400 font-medium">{t("pages.admin.admindashboard.realTimeImmutableClinicalLedgerDemonstrates100")}</p>
          </div>
          
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 px-3.5 py-2 flex items-center gap-2 text-emerald-700 text-xs font-bold">
            <Icon name="faUserShield" className="text-sm animate-pulse" />
            <span>{t("pages.admin.admindashboard.logIntegrityVerified256BitShaChain")}</span>
          </div>
        </div>

        <Card title={t("pages.admin.admindashboard.securityLedgerConsole")} description="Full immutable recording of system modifications, branch context swaps, and stock ERP updates.">
          <div className="space-y-4">
            {/* Filter Matrix */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Icon name="faSearch" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input type="text" placeholder={t("pages.admin.admindashboard.filterLogsByKeyword")} className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 shadow-sm" value={logSearch} onChange={e => setLogSearch(e.target.value)} />
              </div>

              <select value={logModuleFilter} onChange={e => setLogModuleFilter(e.target.value)} className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:border-brand-500 shadow-sm">
                <option value="All">{t("pages.admin.admindashboard.allModules")}</option>
                <option value="Inventory">{t("pages.admin.admindashboard.inventory")}</option>
                <option value="Security">{t("pages.admin.admindashboard.security")}</option>
                <option value="Branches">{t("pages.admin.admindashboard.branches")}</option>
                <option value="HIPAA Sync">{t("pages.admin.admindashboard.hipaaSync")}</option>
              </select>

              <select value={logRoleFilter} onChange={e => setLogRoleFilter(e.target.value)} className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:border-brand-500 shadow-sm">
                <option value="All">{t("pages.admin.admindashboard.allRoles")}</option>
                <option value="Admin">{t("pages.admin.admindashboard.admin2")}</option>
                <option value="System">{t("pages.admin.admindashboard.system2")}</option>
              </select>

              <select value={logSeverityFilter} onChange={e => setLogSeverityFilter(e.target.value)} className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:border-brand-500 shadow-sm">
                <option value="All">{t("pages.admin.admindashboard.allSeverities")}</option>
                <option value="success">{t("pages.admin.admindashboard.success")}</option>
                <option value="info">{t("pages.admin.admindashboard.info")}</option>
                <option value="warning">{t("pages.admin.admindashboard.warning")}</option>
                <option value="critical">{t("pages.admin.admindashboard.critical")}</option>
              </select>

              <Button variant="outline" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-1.5" onClick={() => {
              addAuditLog("Exported filtered HIPAA audit records", "Security", {
                severity: "info"
              });
              exportToCsv(filteredLogs, "hipaa-audit-logs.csv");
            }}>
                <Icon name="faFileExport" />{t("pages.admin.admindashboard.exportHipaaCsv")}</Button>
            </div>

            {/* Audit Logs Table */}
            <Table columns={[{
            header: t("pages.admin.admindashboard.systemUser"),
            render: row => <div>
                      <p className="text-sm font-bold text-slate-900">{row.user}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{row.branch}</span>
                        <Badge tone="secondary" className="text-[8px] uppercase tracking-widest">
                          {row.role}
                        </Badge>
                      </div>
                    </div>
          }, {
            header: t("pages.admin.admindashboard.module"),
            render: row => <Badge tone={row.module === "Security" ? "danger" : row.module === "Branches" ? "primary" : row.module === "Inventory" ? "warning" : "success"} className="text-[8px] uppercase font-black tracking-widest">
                      {row.module}
                    </Badge>
          }, {
            header: t("pages.admin.admindashboard.severity"),
            render: row => <Badge tone={row.severity === "critical" ? "danger" : row.severity === "warning" ? "warning" : row.severity === "success" ? "success" : "secondary"} className="text-[8px] uppercase font-black tracking-widest">
                      {row.severity}
                    </Badge>
          }, {
            header: t("pages.admin.admindashboard.actionLogEntry"),
            render: row => <div>
                      <p className="text-xs font-semibold text-slate-700">{row.action}</p>
                      <p className="text-[9px] font-mono text-slate-400 mt-1">{t("pages.admin.admindashboard.ip")}{row.source}</p>
                    </div>
          }, {
            header: t("pages.admin.admindashboard.integritySignatureHash"),
            render: row => <div className="max-w-[260px] space-y-2">
                      <Badge tone="success" className="gap-1 text-[8px] uppercase font-black tracking-widest">
                        <Icon name="faLock" className="text-[9px]" />{t("pages.admin.admindashboard.logSecuredSigned")}</Badge>
                      <span className="block font-mono text-[9px] text-slate-500 truncate bg-slate-50 px-2 py-1 rounded border border-slate-100" title={row.hash}>
                        HASH-{row.hash.slice(0, 18)}...
                      </span>
                      <p className="font-mono text-[8px] text-slate-300 truncate" title={row.previousHash}>{t("pages.admin.admindashboard.prev")}{row.previousHash.slice(0, 18)}...
                      </p>
                    </div>
          }, {
            header: t("pages.admin.admindashboard.timestamp"),
            render: row => <span className="text-xs text-slate-400 font-bold">{row.timestamp}</span>
          }]} data={filteredLogs} />
          </div>
        </Card>
      </section>}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: ADD INVENTORY STOCK ITEM */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isInventory && <Modal isOpen={isNewItemModalOpen} onClose={() => setIsNewItemModalOpen(false)} title={t("pages.admin.admindashboard.addSupplyPharmacyItem")} size="md">
        <form onSubmit={handleAddInventoryItem} className="space-y-6 pt-4 text-slate-700">
          <div className="space-y-4">
            <Input label="Item Name" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder={t("pages.admin.admindashboard.eGPanadolExtra500mg")} required />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t("pages.admin.admindashboard.category")}</label>
                <select value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} className="w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-brand-500 shadow-sm transition-all">
                  <option value="Medicines">{t("pages.admin.admindashboard.medicinesRx")}</option>
                  <option value="Supplies">{t("pages.admin.admindashboard.clinicalSupplies")}</option>
                  <option value="Equipment">{t("pages.admin.admindashboard.equipmentTools")}</option>
                </select>
              </div>
              
              <Input label="Initial Quantity" type="number" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} min="0" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Smart Reorder Point (Min)" type="number" value={newItemMin} onChange={e => setNewItemMin(e.target.value)} min="1" required />
              
              <Input label="Expiration Date" type="date" value={newItemExpiry} onChange={e => setNewItemExpiry(e.target.value)} required />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsNewItemModalOpen(false)}>{t("pages.admin.admindashboard.cancel")}</Button>
            <Button type="submit" className="px-8 shadow-halo">{t("pages.admin.admindashboard.addSupplyToErp")}</Button>
          </div>
        </form>
      </Modal>}
    </MotionDiv>;
}
export default AdminDashboard;
