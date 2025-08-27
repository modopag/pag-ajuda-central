import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // Check authentication and approval status
    if (!loading) {
      if (!user) {
        // No user session - redirect to admin login
        navigate("/admin/login");
      } else if (user && profile) {
        // User exists, check approval status
        if (profile.status !== 'approved' || !['admin', 'editor'].includes(profile.role)) {
          // User not approved or wrong role - redirect to pending page
          navigate("/admin/pending");
        }
      }
      // If user exists but profile is still loading, wait
    }
  }, [user, profile, loading, navigate]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if no user or user not approved
  if (!user || !profile || profile.status !== 'approved' || !['admin', 'editor'].includes(profile.role)) {
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