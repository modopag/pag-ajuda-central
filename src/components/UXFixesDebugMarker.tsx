import { useEffect } from 'react';

/**
 * Debug marker to confirm UX fixes are working
 * Logs once on first homepage render
 */
export const UXFixesDebugMarker = () => {
  useEffect(() => {
    console.log('🎯 UX Fixes Applied:', {
      cookiePreferencesWired: 'Cookie banner Preferences button should open modal',
      scrollRestoration: 'Routes should scroll to top (except anchors/back/forward)',
      privacyPolicyRedirect: 'Old /politicas-de-privacidade redirects to external URL',
      cookieManagerInFooter: 'Footer has "Gerenciar Cookies" button',
      timestamp: new Date().toISOString()
    });
  }, []);

  return null;
};