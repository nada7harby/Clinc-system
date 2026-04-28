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
      (c) => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password
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
    const newUser = { id: genId(), ...data, status: "active", createdAt: new Date().toISOString().slice(0, 10) };
    users.push(newUser);
    const token = `mock_token_${data.role}_${Date.now()}`;
    return { token, user: newUser };
  },
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  async list({ page = 1, limit = 10, search = "", role = "", status = "" } = {}) {
    await delay();
    let filtered = users;
    if (search) filtered = filtered.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
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
    const newUser = { id: genId(), ...data, status: "active", createdAt: new Date().toISOString().slice(0, 10) };
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
          p.phone.includes(search)
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
    const newPatient = { id: genId(), ...data, status: "active", createdAt: new Date().toISOString().slice(0, 10) };
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
  async list({ page = 1, limit = 10, search = "", doctorId = "", patientId = "", status = "", date = "" } = {}) {
    await delay();
    let filtered = appointments;
    if (search) filtered = filtered.filter((a) => a.patientName.toLowerCase().includes(search.toLowerCase()) || a.doctorName.toLowerCase().includes(search.toLowerCase()));
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
        a.status !== "cancelled"
    );
    if (conflict) {
      throw new Error(
        `Double Booking Alert: Dr. ${conflict.doctorName} is already booked for ${data.time} on ${data.date}.`
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
    return appointments.filter((a) => a.doctorId === doctorId && a.date === today);
  },
};

// ── Services ──────────────────────────────────────────────────────────────────
export const servicesApi = {
  async list({ page = 1, limit = 10, search = "", status = "" } = {}) {
    await delay();
    let filtered = services;
    if (search) filtered = filtered.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));
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
export const analyticsApi = {
  async getStats() {
    await delay(500);
    return MOCK_STATS;
  },

  async getRevenueChart(period = "monthly") {
    await delay(500);
    if (period === "weekly") return MOCK_REVENUE_CHART.slice(-4);
    if (period === "daily") return MOCK_REVENUE_CHART.slice(-7);
    return MOCK_REVENUE_CHART;
  },

  async getStatusChart() {
    await delay(300);
    return MOCK_STATUS_CHART;
  },

  async getBookingsChart() {
    await delay(400);
    return MOCK_BOOKINGS_CHART;
  },

  async getTopDoctors() {
    await delay(500);
    return MOCK_TOP_DOCTORS;
  },

  async getLogs() {
    await delay(300);
    return MOCK_LOGS;
  },
};
