import { ROLES, ROUTES } from "@/constants/appConstants";

export const getNavItems = (role) => {
  const common = [
    {
      label: "Dashboard",
      labelKey: "nav.dashboard",
      href: ROUTES.dashboard,
      icon: "faChartLine",
    },
  ];

  const admin = [
    {
      label: "Staff Directory",
      labelKey: "nav.staffDirectory",
      href: ROUTES.users,
      icon: "faUserShield",
    },
    {
      label: "Clinic Services",
      labelKey: "nav.clinicServices",
      href: ROUTES.services,
      icon: "faStethoscope",
    },
    {
      label: "Appointments",
      labelKey: "nav.appointments",
      href: ROUTES.appointments,
      icon: "faCalendarCheck",
    },
    {
      label: "Patients",
      labelKey: "nav.patients",
      href: ROUTES.patients,
      icon: "faHospitalUser",
    },
    {
      label: "Inventory ERP",
      labelKey: "nav.inventoryErp",
      href: ROUTES.dashboard + "#inventory",
      icon: "faBoxesStacked",
    },
    {
      label: "HIPAA Security Logs",
      labelKey: "nav.auditLogs",
      href: ROUTES.dashboard + "#hipaa",
      icon: "faShieldHalved",
    },
  ];

  const doctor = [
    {
      label: "My Schedule",
      labelKey: "nav.mySchedule",
      href: ROUTES.appointments,
      icon: "faClock",
    },
    {
      label: "My Patients",
      labelKey: "nav.myPatients",
      href: ROUTES.patients,
      icon: "faUserMd",
    },
  ];

  const receptionist = [
    {
      label: "Quick Booking",
      labelKey: "nav.quickBooking",
      href: ROUTES.appointments,
      icon: "faPlusCircle",
    },
    {
      label: "Patient Check-in",
      labelKey: "nav.patientCheckIn",
      href: ROUTES.patients,
      icon: "faAddressCard",
    },
  ];

  const patient = [
    {
      label: "Dashboard",
      labelKey: "nav.dashboard",
      href: ROUTES.patientDashboard,
      icon: "faChartLine",
    },
    {
      label: "Book Appointment",
      labelKey: "nav.bookAppointment",
      href: ROUTES.bookAppointment,
      icon: "faPlusCircle",
    },
    {
      label: "My Appointments",
      labelKey: "nav.myAppointments",
      href: ROUTES.myAppointments,
      icon: "faCalendarAlt",
    },
    {
      label: "Medical History",
      labelKey: "nav.medicalHistory",
      href: ROUTES.medicalHistory,
      icon: "faHistory",
    },
    {
      label: "Profile",
      labelKey: "nav.profile",
      href: ROUTES.profile,
      icon: "faUserCircle",
    },
  ];

  const roleMap = {
    [ROLES.ADMIN]: admin,
    [ROLES.DOCTOR]: doctor,
    [ROLES.RECEPTIONIST]: receptionist,
    [ROLES.PATIENT]: patient,
  };

  return [...common, ...(roleMap[role] || [])];
};
