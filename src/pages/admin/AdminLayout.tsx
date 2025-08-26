import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AuthService } from "@/lib/auth";

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication on mount and redirect if not authenticated
    if (!AuthService.isAuthenticated()) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Don't render anything if not authenticated
  if (!AuthService.isAuthenticated()) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col min-h-screen">
          <AdminHeader />
          
          <main className="flex-1 p-6 bg-muted/30">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}