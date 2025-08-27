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
    console.log('🔐 AdminLayout - Auth state check:', { 
      loading, 
      hasUser: !!user, 
      hasProfile: !!profile, 
      profileStatus: profile?.status,
      profileRole: profile?.role,
      userEmail: user?.email 
    });
    
    if (!loading) {
      if (!user) {
        console.log('❌ AdminLayout - No user session, redirecting to login');
        navigate("/admin/login");
      } else if (user && profile) {
        // User exists, check approval status
        console.log('✅ AdminLayout - User and profile found, checking permissions');
        if (profile.status !== 'approved' || !['admin', 'editor'].includes(profile.role)) {
          console.log('⚠️ AdminLayout - User not approved or wrong role, redirecting to pending');
          navigate("/admin/pending");
        } else {
          console.log('🎉 AdminLayout - User authorized for admin access');
        }
      } else if (user && !profile) {
        console.log('⏳ AdminLayout - User exists but profile still loading, waiting...');
      }
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
    console.log('🚫 AdminLayout - Blocking render due to auth conditions:', {
      hasUser: !!user,
      hasProfile: !!profile, 
      status: profile?.status,
      role: profile?.role
    });
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
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