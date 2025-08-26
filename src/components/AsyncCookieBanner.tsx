import { lazy, Suspense } from 'react';

// Lazy load the cookie banner to not block initial render
const CookieBanner = lazy(() => import('./CookieBanner').then(module => ({ default: module.CookieBanner })));
const CookiePreferencesModal = lazy(() => import('./CookiePreferencesModal').then(module => ({ default: module.CookiePreferencesModal })));

export const AsyncCookieBanner = () => {
  return (
    <Suspense fallback={null}>
      <CookieBanner />
      <CookiePreferencesModal />
    </Suspense>
  );
};