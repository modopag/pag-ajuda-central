import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Settings } from 'lucide-react';

/**
 * Button to open cookie preferences modal
 * Use this in footer or other areas where users can manage their consent
 */
export const CookieManageButton = () => {
  const { openPreferences } = useCookieConsent();

  return (
    <button
      onClick={openPreferences}
      className="text-gray-300 hover:text-modopag-yellow transition-colors text-sm flex items-center gap-2"
      aria-label="Gerenciar preferências de cookies"
    >
      <Settings className="w-3 h-3" />
      Gerenciar Cookies
    </button>
  );
};