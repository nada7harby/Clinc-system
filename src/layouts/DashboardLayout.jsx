import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useUIStore } from "@/store/uiStore";
import { classNames } from "@/utils";

function DashboardLayout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="app-shell flex min-h-screen">
      <Sidebar />

      <div
        className={classNames(
          "dashboard-content flex flex-1 flex-col transition-all duration-300",
        )}
        data-collapsed={sidebarCollapsed ? "true" : "false"}
      >
        <Navbar />

        <main className="flex-1 px-6 pb-10 pt-2 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
