export const APP_NAME = "MediCore Clinic";

export const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  RECEPTIONIST: "receptionist",
  PATIENT: "patient",
};

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  // Admin
  adminDashboard: "/dashboard/admin",
  users: "/dashboard/users",
  services: "/dashboard/services",
  // Doctor
  doctorDashboard: "/dashboard/doctor",
  doctorSession: "/dashboard/doctor/session",
  // Receptionist
  receptionistDashboard: "/dashboard/receptionist",
  // Shared
  patients: "/dashboard/patients",
  appointments: "/dashboard/appointments",
  // Patient
  patientDashboard: "/dashboard/patient",
  myAppointments: "/dashboard/my-appointments",
  bookAppointment: "/dashboard/book",
  medicalHistory: "/dashboard/medical-history",
  profile: "/dashboard/profile",
};

export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const STATUS_COLORS = {
  pending: "warning",
  confirmed: "primary",
  completed: "success",
  cancelled: "danger",
};

export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  DEPOSIT: "deposit",
  PAID: "paid",
  INSURANCE: "insurance",
};

export const PAYMENT_METHOD = {
  CARD: "card",
  CASH: "cash",
  WALLET: "wallet",
  QR: "qr",
  INSURANCE: "insurance",
};

export const PAYMENT_STATUS_COLORS = {
  unpaid: "danger",
  deposit: "warning",
  paid: "success",
  insurance: "primary",
};
