import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <TopBar />
      {/* Desktop: offset for sidebar. Mobile: no left offset, padding for bottom nav */}
      <main className="md:ml-[260px] pt-14 pb-20 md:pb-6 transition-all duration-300 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
