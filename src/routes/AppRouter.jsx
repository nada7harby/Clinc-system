import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { DashboardLayout, MainLayout } from "@/layouts";
import { 
  LoginPage, 
  RegisterPage, 
  AdminDashboard, 
  DoctorDashboard,
  PatientSessionPage,
  ReceptionistDashboard,
  PatientDashboard,
  BookAppointmentPage,
  MedicalHistoryPage,
  ProfilePage,
  UsersManagement, 
  ServicesManagement,
  AppointmentsPage, 
  PatientsPage,
  HomePage, 
  NotFoundPage 
} from "@/pages";
import { ROUTES, ROLES } from "@/constants/appConstants";
import { ProtectedRoute, GuestRoute } from "@/components/ProtectedRoute";
import { DashboardRedirect } from "@/components/DashboardRedirect";

const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { 
        path: ROUTES.login, 
        element: <GuestRoute><LoginPage /></GuestRoute> 
      },
      { 
        path: ROUTES.register, 
        element: <GuestRoute><RegisterPage /></GuestRoute> 
      },
    ],
  },

  // Protected Dashboard Routes
  {
    path: "dashboard",
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardRedirect /> },
      
      // Admin Only
      { 
        path: "admin", 
        element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboard /></ProtectedRoute> 
      },
      { 
        path: "users", 
        element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><UsersManagement /></ProtectedRoute> 
      },
      { 
        path: "services", 
        element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><ServicesManagement /></ProtectedRoute> 
      },

      // Shared Routes (Role logic handled inside components)
      { path: "appointments", element: <AppointmentsPage /> },
      { path: "patients", element: <PatientsPage /> },

      // Doctor Only
      { 
        path: "doctor", 
        element: <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}><DoctorDashboard /></ProtectedRoute> 
      },
      {
        path: "doctor/session/:appointmentId",
        element: <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}><PatientSessionPage /></ProtectedRoute>,
      },

      // Receptionist Only
      { 
        path: "receptionist", 
        element: <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}><ReceptionistDashboard /></ProtectedRoute> 
      },

      // Patient Only
      { 
        path: "patient", 
        element: <ProtectedRoute allowedRoles={[ROLES.PATIENT]}><PatientDashboard /></ProtectedRoute> 
      },
      { 
        path: "book", 
        element: <ProtectedRoute allowedRoles={[ROLES.PATIENT]}><BookAppointmentPage /></ProtectedRoute> 
      },
      { 
        path: "my-appointments", 
        element: <ProtectedRoute allowedRoles={[ROLES.PATIENT]}><AppointmentsPage /></ProtectedRoute> 
      },
      { 
        path: "medical-history", 
        element: <ProtectedRoute allowedRoles={[ROLES.PATIENT]}><MedicalHistoryPage /></ProtectedRoute> 
      },
      { 
        path: "profile", 
        element: <ProtectedRoute allowedRoles={[ROLES.PATIENT]}><ProfilePage /></ProtectedRoute> 
      },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
