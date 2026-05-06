import { ROLES, APPOINTMENT_STATUS } from "@/constants/appConstants";

// ─── Helper for dates ────────────────────────────────────────────────────────
const getOffsetDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

// ─── Users (Arabic Names) ─────────────────────────────────────────────────────
export const MOCK_USERS = [
  {
    id: "u1",
    name: "Dr. Ahmed Mansour",
    email: "ahmed@medicore.com",
    role: ROLES.DOCTOR,
    specialization: "Cardiology",
    phone: "+20 100 123 4567",
    status: "active",
    createdAt: "2024-01-10",
  },
  {
    id: "u2",
    name: "Dr. Layla Hassan",
    email: "layla@medicore.com",
    role: ROLES.DOCTOR,
    specialization: "Neurology",
    phone: "+20 111 234 5678",
    status: "active",
    createdAt: "2024-02-15",
  },
  {
    id: "u3",
    name: "Nour El-Din",
    email: "nour@medicore.com",
    role: ROLES.RECEPTIONIST,
    specialization: null,
    phone: "+20 122 345 6789",
    status: "active",
    createdAt: "2024-03-01",
  },
  {
    id: "u4",
    name: "Mostafa Mahmoud",
    email: "admin@medicore.com",
    role: ROLES.ADMIN,
    specialization: null,
    phone: "+20 155 000 0000",
    status: "active",
    createdAt: "2024-01-01",
  },
  {
    id: "u5",
    name: "Dr. Fatima Al-Zahra",
    email: "fatima@medicore.com",
    role: ROLES.DOCTOR,
    specialization: "Pediatrics",
    phone: "+20 109 876 5432",
    status: "active",
    createdAt: "2024-04-01",
  },
];

// ─── Patients (Arabic Names) ──────────────────────────────────────────────────
export const MOCK_PATIENTS = [
  {
    id: "p1",
    name: "Youssef Ibrahim",
    email: "youssef@email.com",
    phone: "+20 100 555 1111",
    dob: "1985-06-15",
    gender: "male",
    bloodType: "A+",
    address: "Maadi, Cairo",
    status: "active",
    createdAt: "2024-01-20",
  },
  {
    id: "p2",
    name: "Mariam Ali",
    email: "mariam@email.com",
    phone: "+20 111 666 3333",
    dob: "1992-11-22",
    gender: "female",
    bloodType: "O-",
    address: "Zamalek, Cairo",
    status: "active",
    createdAt: "2024-02-05",
  },
  {
    id: "p3",
    name: "Khaled El-Sayed",
    email: "khaled@email.com",
    phone: "+20 122 777 5555",
    dob: "1978-03-30",
    gender: "male",
    bloodType: "B+",
    address: "Alexandria",
    status: "active",
    createdAt: "2024-03-10",
  },
  {
    id: "p4",
    name: "Hala Mohammed",
    email: "hala@email.com",
    phone: "+20 155 888 7777",
    dob: "2001-08-12",
    gender: "female",
    bloodType: "AB+",
    address: "Nasr City",
    status: "active",
    createdAt: "2024-04-15",
  },
];

// ─── Services ─────────────────────────────────────────────────────────────────
export const MOCK_SERVICES = [
  {
    id: "s1",
    name: "General Consultation",
    price: 300,
    duration: 30,
    category: "General",
    status: "active",
  },
  {
    id: "s2",
    name: "Heart Ultrasound",
    price: 850,
    duration: 45,
    category: "Cardiology",
    status: "active",
  },
  {
    id: "s3",
    name: "Neurological Exam",
    price: 1200,
    duration: 60,
    category: "Neurology",
    status: "active",
  },
  {
    id: "s4",
    name: "Child Vaccination",
    price: 450,
    duration: 20,
    category: "Pediatrics",
    status: "active",
  },
];

// ─── Appointments (Spread Across Week) ─────────────────────────────────────────
export const MOCK_APPOINTMENTS = [
  {
    id: "a0",
    patientId: "p1",
    patientName: "Youssef Ibrahim",
    doctorId: "u1",
    doctorName: "Dr. Ahmed Mansour",
    serviceId: "s1",
    serviceName: "General Consultation",
    date: getOffsetDate(-10),
    time: "10:00",
    status: APPOINTMENT_STATUS.COMPLETED,
    price: 300,
    symptoms: "Headache, fatigue",
    diagnosis: "Mild dehydration",
    notes:
      "Advised increased fluid intake and rest. Follow-up if symptoms persist.",
    prescription: "Oral rehydration salts, 2x daily",
  },
  {
    id: "a1",
    patientId: "p1",
    patientName: "Youssef Ibrahim",
    doctorId: "u1",
    doctorName: "Dr. Ahmed Mansour",
    serviceId: "s2",
    serviceName: "Heart Ultrasound",
    date: getOffsetDate(0),
    time: "09:00",
    status: APPOINTMENT_STATUS.CONFIRMED,
    price: 850,
  },
  {
    id: "a2",
    patientId: "p2",
    patientName: "Mariam Ali",
    doctorId: "u1",
    doctorName: "Dr. Ahmed Mansour",
    serviceId: "s1",
    serviceName: "General Consultation",
    date: getOffsetDate(1),
    time: "10:30",
    status: APPOINTMENT_STATUS.PENDING,
    price: 300,
  },
  {
    id: "a3",
    patientId: "p3",
    patientName: "Khaled El-Sayed",
    doctorId: "u2",
    doctorName: "Dr. Layla Hassan",
    serviceId: "s3",
    serviceName: "Neurological Exam",
    date: getOffsetDate(2),
    time: "11:30",
    status: APPOINTMENT_STATUS.CONFIRMED,
    price: 1200,
  },
  {
    id: "a4",
    patientId: "p4",
    patientName: "Hala Mohammed",
    doctorId: "u5",
    doctorName: "Dr. Fatima Al-Zahra",
    serviceId: "s4",
    serviceName: "Pediatrics",
    date: getOffsetDate(3),
    time: "12:00",
    status: APPOINTMENT_STATUS.PENDING,
    price: 450,
  },
  {
    id: "a5",
    patientId: "p1",
    patientName: "Youssef Ibrahim",
    doctorId: "u1",
    doctorName: "Dr. Ahmed Mansour",
    serviceId: "s2",
    serviceName: "Heart Ultrasound",
    date: getOffsetDate(4),
    time: "14:00",
    status: APPOINTMENT_STATUS.CONFIRMED,
    price: 850,
  },
];

// ─── Analytics ────────────────────────────────────────────────────────────────
export const MOCK_STATS = {
  totalPatients: 1450,
  totalAppointments: 4230,
  totalRevenue: 385600,
  totalDoctors: 15,
  pendingAppointments: 18,
};
export const MOCK_REVENUE_CHART = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 75000 },
  { month: "Jun", revenue: 68000 },
];
export const MOCK_STATUS_CHART = [
  { name: "Completed", value: 2800, color: "#14b8a6" },
  { name: "Confirmed", value: 950, color: "#307672" },
  { name: "Pending", value: 340, color: "#f59e0b" },
  { name: "Cancelled", value: 140, color: "#ef4444" },
];
export const MOCK_BOOKINGS_CHART = [
  { day: "Mon", bookings: 45 },
  { day: "Tue", bookings: 52 },
  { day: "Wed", bookings: 38 },
  { day: "Thu", bookings: 65 },
  { day: "Fri", bookings: 70 },
  { day: "Sat", bookings: 42 },
  { day: "Sun", bookings: 15 },
];
export const MOCK_TOP_DOCTORS = [
  {
    name: "Dr. Ahmed Mansour",
    specialty: "Cardiology",
    appointments: 184,
    rating: 4.9,
  },
  {
    name: "Dr. Layla Hassan",
    specialty: "Neurology",
    appointments: 156,
    rating: 4.8,
  },
  {
    name: "Dr. Fatima Al-Zahra",
    specialty: "Pediatrics",
    appointments: 142,
    rating: 4.9,
  },
];
export const MOCK_LOGS = [
  {
    id: 1,
    type: "user",
    user: "Mostafa",
    action: "added new staff",
    target: "Dr. Layla",
    time: "5m ago",
    icon: "faUserPlus",
    color: "text-brand-500",
  },
  {
    id: 2,
    type: "appt",
    user: "Nour El-Din",
    action: "confirmed booking for",
    target: "Youssef I.",
    time: "20m ago",
    icon: "faCheckCircle",
    color: "text-emerald-500",
  },
  {
    id: 3,
    type: "sys",
    user: "System",
    action: "generated daily",
    target: "revenue report",
    time: "1h ago",
    icon: "faChartPie",
    color: "text-brand-400",
  },
];
export const MOCK_AUTH_CREDENTIALS = [
  {
    email: "admin@medicore.com",
    password: "admin123",
    userId: "u4",
    role: ROLES.ADMIN,
  },
  {
    email: "ahmed@medicore.com",
    password: "doctor123",
    userId: "u1",
    role: ROLES.DOCTOR,
  },
  {
    email: "nour@medicore.com",
    password: "receptionist123",
    userId: "u3",
    role: ROLES.RECEPTIONIST,
  },
  {
    email: "youssef@email.com",
    password: "patient123",
    userId: "p1",
    role: ROLES.PATIENT,
  },
];
