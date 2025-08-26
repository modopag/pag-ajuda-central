import { useState, useEffect, useCallback } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface ConsentState {
  hasConsented: boolean;
  preferences: CookiePreferences;
  timestamp: number;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true, // Always true, can't be disabled
  analytics: false,
  marketing: false,
};

const STORAGE_KEY = 'modopag_cookie_consent';
const CONSENT_VERSION = '1.0';

export const useCookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [hasConsented, setHasConsented] = useState(false);

  // Check if user has DNT (Do Not Track) enabled
  const isDNTEnabled = useCallback(() => {
    if (typeof navigator === 'undefined') return false;
    
    return navigator.doNotTrack === '1' || 
           (window as any).doNotTrack === '1' || 
           (navigator as any).msDoNotTrack === '1';
  }, []);

  // Load saved consent from localStorage
  useEffect(() => {
    const savedConsent = localStorage.getItem(STORAGE_KEY);
    
    if (savedConsent) {
      try {
        const consent: ConsentState = JSON.parse(savedConsent);
        
        // Check if consent is still valid (30 days)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        if (consent.timestamp > thirtyDaysAgo) {
          setPreferences(consent.preferences);
          setHasConsented(consent.hasConsented);
          updateConsentMode(consent.preferences);
        } else {
          // Consent expired, show banner again
          setShowBanner(true);
        }
      } catch (error) {
        console.error('Error parsing saved consent:', error);
        setShowBanner(true);
      }
    } else {
      // No saved consent, show banner
      setShowBanner(true);
    }

    // If DNT is enabled, respect it
    if (isDNTEnabled()) {
      const dntPreferences = { ...DEFAULT_PREFERENCES, analytics: false, marketing: false };
      setPreferences(dntPreferences);
      updateConsentMode(dntPreferences);
      setHasConsented(true);
      setShowBanner(false);
    }
  }, [isDNTEnabled]);

  // Update Google Consent Mode
  const updateConsentMode = useCallback((prefs: CookiePreferences) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        ad_storage: prefs.marketing ? 'granted' : 'denied',
        ad_user_data: prefs.marketing ? 'granted' : 'denied',
        ad_personalization: prefs.marketing ? 'granted' : 'denied',
      });

      // Track consent update
      window.gtag('event', 'consent_update', {
        analytics_enabled: prefs.analytics,
        marketing_enabled: prefs.marketing,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  // Save consent to localStorage
  const saveConsent = useCallback((prefs: CookiePreferences, consented: boolean) => {
    const consentState: ConsentState = {
      hasConsented: consented,
      preferences: prefs,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(consentState));
    setPreferences(prefs);
    setHasConsented(consented);
    updateConsentMode(prefs);
  }, [updateConsentMode]);

  // Accept all cookies
  const acceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };

    saveConsent(allAccepted, true);
    setShowBanner(false);
    setShowPreferences(false);
  }, [saveConsent]);

  // Reject all non-necessary cookies
  const rejectAll = useCallback(() => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };

    saveConsent(onlyNecessary, true);
    setShowBanner(false);
    setShowPreferences(false);
  }, [saveConsent]);

  // Save custom preferences
  const savePreferences = useCallback((prefs: CookiePreferences) => {
    saveConsent(prefs, true);
    setShowBanner(false);
    setShowPreferences(false);
  }, [saveConsent]);

  // Show preferences modal
  const openPreferences = useCallback(() => {
    setShowPreferences(true);
    setShowBanner(false);
  }, []);

  // Reset consent (for testing or user request)
  const resetConsent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPreferences(DEFAULT_PREFERENCES);
    setHasConsented(false);
    setShowBanner(true);
    setShowPreferences(false);
    
    // Reset consent mode to default (denied)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
      });
    }
  }, []);

  return {
    showBanner,
    showPreferences,
    preferences,
    hasConsented,
    isDNTEnabled: isDNTEnabled(),
    acceptAll,
    rejectAll,
    savePreferences,
    openPreferences,
    resetConsent,
    setShowPreferences,
  };
};