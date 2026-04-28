import { ROLES, ROUTES } from "@/constants/appConstants";

export const getNavItems = (role) => {
  const common = [
    { label: "Dashboard", href: ROUTES.dashboard, icon: "faChartLine" },
  ];

  const admin = [
    { label: "Staff Directory", href: ROUTES.users, icon: "faUserShield" },
    { label: "Clinic Services", href: ROUTES.services, icon: "faStethoscope" },
    {
      label: "Appointments",
      href: ROUTES.appointments,
      icon: "faCalendarCheck",
    },
    {
      label: "Patients",
      href: ROUTES.patients,
      icon: "faHospitalUser",
    },
  ];

  const doctor = [
    { label: "My Schedule", href: ROUTES.appointments, icon: "faClock" },
    { label: "My Patients", href: ROUTES.patients, icon: "faUserMd" },
  ];

  const receptionist = [
    { label: "Quick Booking", href: ROUTES.appointments, icon: "faPlusCircle" },
    { label: "Patient Check-in", href: ROUTES.patients, icon: "faAddressCard" },
  ];

  const patient = [
    { label: "Dashboard", href: ROUTES.patientDashboard, icon: "faChartLine" },
    { label: "Book Appointment", href: ROUTES.bookAppointment, icon: "faPlusCircle" },
    { label: "My Appointments", href: ROUTES.myAppointments, icon: "faCalendarAlt" },
    { label: "Medical History", href: ROUTES.medicalHistory, icon: "faHistory" },
    { label: "Profile", href: ROUTES.profile, icon: "faUserCircle" },
  ];

  const roleMap = {
    [ROLES.ADMIN]: admin,
    [ROLES.DOCTOR]: doctor,
    [ROLES.RECEPTIONIST]: receptionist,
    [ROLES.PATIENT]: patient,
  };

  return [...common, ...(roleMap[role] || [])];
};
