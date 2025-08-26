import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { CookieBanner } from '@/components/CookieBanner';
import { CookiePreferencesModal } from '@/components/CookiePreferencesModal';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { GA4Debug } from '@/components/GA4Debug';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import { PerformanceTracker } from '@/components/performance/PerformanceTracker';
import { QAChecklist } from '@/components/qa/QAChecklist';
import { QASummary } from '@/components/qa/QASummary';
import { RedirectHandler } from '@/components/RedirectHandler';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useSettings } from '@/hooks/useSettings';
import Gone from "@/pages/Gone";

// Lazy load main pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const CategorySilo = lazy(() => import("./pages/CategorySilo"));
const ArticleSilo = lazy(() => import("./pages/ArticleSilo"));
const Search = lazy(() => import("./pages/Search"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const RobotsTxt = lazy(() => import("./pages/RobotsTxt"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PoliticasPrivacidade = lazy(() => import("./pages/PoliticasPrivacidade"));

// Lazy load admin pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminArticles = lazy(() => import("./pages/admin/AdminArticles"));
const AdminArticleEdit = lazy(() => import("./pages/admin/AdminArticleEdit"));
const AdminArticleNew = lazy(() => import("./pages/admin/AdminArticleNew"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminTags = lazy(() => import("./pages/admin/AdminTags"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminRedirects = lazy(() => import("./pages/admin/AdminRedirects"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminFeedback = lazy(() => import("./pages/admin/AdminFeedback"));
const AdminMonitoring = lazy(() => import("./pages/admin/AdminMonitoring"));

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

const AppContent = () => {
  const { seo } = useSettings();
  
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <RedirectHandler />
      <GoogleAnalytics measurementId={seo.google_analytics_id} />
      
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Reserved routes - highest priority */}
          <Route path="/" element={<Index />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/sitemap.xml" element={<Sitemap />} />
          <Route path="/robots.txt" element={<RobotsTxt />} />
          <Route path="/politicas-de-privacidade" element={<PoliticasPrivacidade />} />
          <Route path="/gone" element={<Gone />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="articles" element={<AdminArticles />} />
            <Route path="articles/new" element={<AdminArticleNew />} />
            <Route path="articles/:id/edit" element={<AdminArticleEdit />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="tags" element={<AdminTags />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="redirects" element={<AdminRedirects />} />  
            <Route path="monitoring" element={<AdminMonitoring />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="feedback" element={<AdminFeedback />} />
          </Route>
          
          {/* NEW SILO URLs */}
          <Route path="/:categorySlug/" element={<CategorySilo />} />
          <Route path="/:categorySlug/:articleSlug" element={<ArticleSilo />} />
          
          {/* Catch-all 404 - MUST be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />

          <AppContent />

          <CookieBanner />
          <CookiePreferencesModal />
          <GA4Debug />
          <PerformanceMonitor />
          <PerformanceTracker />
          <QAChecklist />
          <QASummary />
        </ErrorBoundary>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;