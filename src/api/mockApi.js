import { delay, paginate } from "./mockHelpers";
import {
  MOCK_USERS,
  MOCK_PATIENTS,
  MOCK_APPOINTMENTS,
  MOCK_SERVICES,
  MOCK_STATS,
  MOCK_REVENUE_CHART,
  MOCK_STATUS_CHART,
  MOCK_BOOKINGS_CHART,
  MOCK_TOP_DOCTORS,
  MOCK_LOGS,
  MOCK_AUTH_CREDENTIALS,
} from "@/mock/mockData";

// ── In-memory mutable stores ──────────────────────────────────────────────────
let users = [...MOCK_USERS];
let patients = [...MOCK_PATIENTS];
let appointments = [...MOCK_APPOINTMENTS];
let services = [...MOCK_SERVICES];
let nextId = 1000;
const genId = () => `id_${++nextId}`;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  async login({ email, password }) {
    await delay(600);
    const cred = MOCK_AUTH_CREDENTIALS.find(
      (c) =>
        c.email.toLowerCase() === email.trim().toLowerCase() &&
        c.password === password,
    );
    if (!cred) throw new Error("Invalid email or password.");

    let profile = users.find((u) => u.id === cred.userId);
    if (!profile) {
      profile = patients.find((p) => p.id === cred.userId);
    }
    const token = `mock_token_${cred.role}_${Date.now()}`;
    return { token, user: { ...profile, role: cred.role } };
  },

  async register(data) {
    await delay(800);
    const exists = users.some((u) => u.email === data.email);
    if (exists) throw new Error("Email already registered.");
    const newUser = {
      id: genId(),
      ...data,
      status: "active",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    users.push(newUser);
    const token = `mock_token_${data.role}_${Date.now()}`;
    return { token, user: newUser };
  },
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  async list({
    page = 1,
    limit = 10,
    search = "",
    role = "",
    status = "",
  } = {}) {
    await delay();
    let filtered = users;
    if (search)
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      );
    if (role) filtered = filtered.filter((u) => u.role === role);
    if (status) filtered = filtered.filter((u) => u.status === status);
    return paginate(filtered, page, limit);
  },

  async getById(id) {
    await delay();
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error("User not found.");
    return user;
  },

  async create(data) {
    await delay(600);
    const newUser = {
      id: genId(),
      ...data,
      status: "active",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    users.push(newUser);
    return newUser;
  },

  async update(id, data) {
    await delay(600);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error("User not found.");
    users[idx] = { ...users[idx], ...data };
    return users[idx];
  },

  async remove(id) {
    await delay(600);
    users = users.filter((u) => u.id !== id);
    return { success: true };
  },
};

// ── Patients ──────────────────────────────────────────────────────────────────
export const patientsApi = {
  async list({ page = 1, limit = 10, search = "" } = {}) {
    await delay();
    let filtered = patients;
    if (search)
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.email.toLowerCase().includes(search.toLowerCase()) ||
          p.phone.includes(search),
      );
    return paginate(filtered, page, limit);
  },

  async getById(id) {
    await delay();
    const p = patients.find((p) => p.id === id);
    if (!p) throw new Error("Patient not found.");
    return p;
  },

  async create(data) {
    await delay(600);
    const newPatient = {
      id: genId(),
      ...data,
      status: "active",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    patients.push(newPatient);
    return newPatient;
  },

  async update(id, data) {
    await delay(600);
    const idx = patients.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Patient not found.");
    patients[idx] = { ...patients[idx], ...data };
    return patients[idx];
  },

  async remove(id) {
    await delay(600);
    patients = patients.filter((p) => p.id !== id);
    return { success: true };
  },
};

// ── Appointments ──────────────────────────────────────────────────────────────
export const appointmentsApi = {
  async list({
    page = 1,
    limit = 10,
    search = "",
    doctorId = "",
    patientId = "",
    status = "",
    date = "",
  } = {}) {
    await delay();
    let filtered = appointments;
    if (search)
      filtered = filtered.filter(
        (a) =>
          a.patientName.toLowerCase().includes(search.toLowerCase()) ||
          a.doctorName.toLowerCase().includes(search.toLowerCase()),
      );
    if (doctorId) filtered = filtered.filter((a) => a.doctorId === doctorId);
    if (patientId) filtered = filtered.filter((a) => a.patientId === patientId);
    if (status) filtered = filtered.filter((a) => a.status === status);
    if (date) filtered = filtered.filter((a) => a.date === date);
    return paginate(filtered, page, limit);
  },

  async getById(id) {
    await delay();
    const a = appointments.find((a) => a.id === id);
    if (!a) throw new Error("Appointment not found.");
    return a;
  },

  async create(data) {
    await delay(600);
    // Auto conflict detection (simulated)
    const conflict = appointments.find(
      (a) =>
        a.doctorId === data.doctorId &&
        a.date === data.date &&
        a.time === data.time &&
        a.status !== "cancelled",
    );
    if (conflict) {
      throw new Error(
        `Double Booking Alert: Dr. ${conflict.doctorName} is already booked for ${data.time} on ${data.date}.`,
      );
    }
    const newAppt = {
      id: genId(),
      ...data,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    appointments.push(newAppt);
    return newAppt;
  },

  async update(id, data) {
    await delay(600);
    const idx = appointments.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Appointment not found.");
    appointments[idx] = { ...appointments[idx], ...data };
    return appointments[idx];
  },

  async remove(id) {
    await delay(600);
    appointments = appointments.filter((a) => a.id !== id);
    return { success: true };
  },

  async getTodayForDoctor(doctorId) {
    await delay();
    const today = new Date().toISOString().slice(0, 10);
    return appointments.filter(
      (a) => a.doctorId === doctorId && a.date === today,
    );
  },
};

// ── Services ──────────────────────────────────────────────────────────────────
export const servicesApi = {
  async list({ page = 1, limit = 10, search = "", status = "" } = {}) {
    await delay();
    let filtered = services;
    if (search)
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.category.toLowerCase().includes(search.toLowerCase()),
      );
    if (status) filtered = filtered.filter((s) => s.status === status);
    return paginate(filtered, page, limit);
  },

  async getById(id) {
    await delay();
    const s = services.find((s) => s.id === id);
    if (!s) throw new Error("Service not found.");
    return s;
  },

  async create(data) {
    await delay(600);
    const newService = { id: genId(), ...data };
    services.push(newService);
    return newService;
  },

  async update(id, data) {
    await delay(600);
    const idx = services.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Service not found.");
    services[idx] = { ...services[idx], ...data };
    return services[idx];
  },

  async remove(id) {
    await delay(600);
    services = services.filter((s) => s.id !== id);
    return { success: true };
  },
};

// ── Analytics ─────────────────────────────────────────────────────────────────
const parseDate = (value) => {
  if (!value) return null;
  return new Date(`${value}T00:00:00`);
};

const getDateRangeStart = (dateRange) => {
  if (!dateRange || dateRange === "all") return null;
  const days = Number.parseInt(dateRange.replace("d", ""), 10);
  if (Number.isNaN(days)) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
};

const getServiceCategory = (serviceId) => {
  const service = services.find((item) => item.id === serviceId);
  return service?.category?.toLowerCase() || "";
};

const filterAppointmentsForAnalytics = (items, filters = {}) => {
  let filtered = [...items];
  const doctorId =
    filters.doctorId && filters.doctorId !== "all" ? filters.doctorId : "";
  const status =
    filters.status && filters.status !== "all" ? filters.status : "";
  const service =
    filters.service && filters.service !== "all" ? filters.service : "";
  const startDate = getDateRangeStart(filters.dateRange);
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  if (doctorId) {
    filtered = filtered.filter((item) => item.doctorId === doctorId);
  }
  if (status) {
    filtered = filtered.filter((item) => item.status === status);
  }
  if (service) {
    filtered = filtered.filter((item) => {
      const category = getServiceCategory(item.serviceId);
      return category === service || item.serviceId === service;
    });
  }
  if (startDate) {
    filtered = filtered.filter((item) => {
      const date = parseDate(item.date);
      if (!date) return false;
      return date >= startDate && date <= endDate;
    });
  }

  return filtered;
};

const getRevenueForAppointment = (item) => {
  if (item.status === "cancelled" || item.status === "pending") return 0;
  return Number(item.price || 0);
};

const buildRevenueSeries = (period, items) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (period === "daily") {
    const days = Array.from({ length: 7 }, (_, idx) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - idx));
      const label = date.toLocaleString("en-US", { weekday: "short" });
      const dateKey = date.toISOString().slice(0, 10);
      const revenue = items
        .filter((item) => item.date === dateKey)
        .reduce((sum, item) => sum + getRevenueForAppointment(item), 0);
      return { month: label, revenue };
    });
    return days;
  }

  if (period === "weekly") {
    const weeks = Array.from({ length: 4 }, (_, idx) => ({
      month: `Wk ${idx + 1}`,
      revenue: 0,
    }));
    items.forEach((item) => {
      const date = parseDate(item.date);
      if (!date) return;
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      if (diffDays < 0 || diffDays > 27) return;
      const bucket = 3 - Math.floor(diffDays / 7);
      if (bucket >= 0 && bucket < weeks.length) {
        weeks[bucket].revenue += getRevenueForAppointment(item);
      }
    });
    return weeks;
  }

  const months = Array.from({ length: 6 }, (_, idx) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    return {
      month: date.toLocaleString("en-US", { month: "short" }),
      revenue: 0,
    };
  });
  items.forEach((item) => {
    const date = parseDate(item.date);
    if (!date) return;
    const monthDiff =
      (now.getFullYear() - date.getFullYear()) * 12 +
      (now.getMonth() - date.getMonth());
    if (monthDiff < 0 || monthDiff > 5) return;
    const bucket = 5 - monthDiff;
    months[bucket].revenue += getRevenueForAppointment(item);
  });
  return months;
};

const buildBookingsSeries = (items) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, idx) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - idx));
    const label = date.toLocaleString("en-US", { weekday: "short" });
    const dateKey = date.toISOString().slice(0, 10);
    const bookings = items.filter((item) => item.date === dateKey).length;
    return { day: label, bookings };
  });
};

export const analyticsApi = {
  async getStats(filters = {}) {
    await delay(500);
    const filtered = filterAppointmentsForAnalytics(appointments, filters);
    const uniquePatients = new Set(filtered.map((item) => item.patientId));
    const uniqueDoctors = new Set(filtered.map((item) => item.doctorId));
    const totalRevenue = filtered.reduce(
      (sum, item) => sum + getRevenueForAppointment(item),
      0,
    );
    const pendingAppointments = filtered.filter(
      (item) => item.status === "pending",
    ).length;
    return {
      totalPatients: uniquePatients.size,
      totalAppointments: filtered.length,
      totalRevenue,
      totalDoctors: uniqueDoctors.size,
      pendingAppointments,
    };
  },

  async getRevenueChart(period = "monthly", filters = {}) {
    await delay(500);
    const filtered = filterAppointmentsForAnalytics(appointments, filters);
    return buildRevenueSeries(period, filtered);
  },

  async getStatusChart(filters = {}) {
    await delay(300);
    const filtered = filterAppointmentsForAnalytics(appointments, filters);
    const statusMap = {
      completed: { name: "Completed", value: 0, color: "#14b8a6" },
      confirmed: { name: "Confirmed", value: 0, color: "#307672" },
      pending: { name: "Pending", value: 0, color: "#f59e0b" },
      cancelled: { name: "Cancelled", value: 0, color: "#ef4444" },
    };
    filtered.forEach((item) => {
      if (statusMap[item.status]) {
        statusMap[item.status].value += 1;
      }
    });
    return Object.values(statusMap);
  },

  async getBookingsChart(filters = {}) {
    await delay(400);
    const filtered = filterAppointmentsForAnalytics(appointments, filters);
    return buildBookingsSeries(filtered);
  },

  async getTopDoctors(filters = {}) {
    await delay(500);
    const filtered = filterAppointmentsForAnalytics(appointments, filters);
    const counts = new Map();
    filtered.forEach((item) => {
      counts.set(item.doctorId, (counts.get(item.doctorId) || 0) + 1);
    });
    const ratingMap = new Map(
      MOCK_TOP_DOCTORS.map((item) => [item.name, item.rating]),
    );
    return Array.from(counts.entries())
      .map(([doctorId, count]) => {
        const doctor = users.find((item) => item.id === doctorId);
        return {
          name: doctor?.name || "Unknown",
          specialty: doctor?.specialization || "General",
          appointments: count,
          rating: ratingMap.get(doctor?.name) || 4.7,
        };
      })
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 6);
  },

  async getLogs(filters = {}) {
    await delay(300);
    return MOCK_LOGS;
  },
};
