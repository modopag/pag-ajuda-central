import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { X, Cookie, Settings } from 'lucide-react';

export const CookieBanner = () => {
  const {
    showBanner,
    acceptAll,
    rejectAll,
    openPreferences,
    isDNTEnabled,
  } = useCookieConsent();

  const bannerRef = useRef<HTMLDivElement>(null);

  // Auto-focus on banner when it appears for accessibility
  useEffect(() => {
    if (showBanner && bannerRef.current) {
      bannerRef.current.focus();
    }
  }, [showBanner]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!showBanner) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        rejectAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showBanner, rejectAll]);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
      <Card 
        ref={bannerRef}
        className="max-w-4xl mx-auto shadow-lg"
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description"
        tabIndex={-1}
      >
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Cookie className="w-5 h-5 text-primary" />
                <h3 id="cookie-banner-title" className="font-semibold text-foreground">
                  Cookies e Privacidade
                </h3>
              </div>
              
              <p id="cookie-banner-description" className="text-sm text-muted-foreground mb-3">
                Usamos cookies para melhorar sua experiência e analisar o tráfego do site. 
                Você pode aceitar todos, recusar ou escolher quais categorias permitir.{' '}
                <a 
                  href="https://modopag.com.br/politicas-de-privacidade/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary transition-colors"
                  aria-label="Leia nossa Política de Privacidade (abre em nova aba)"
                >
                  Leia nossa Política de Privacidade
                </a>.
              </p>

              {isDNTEnabled && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    ℹ️ Detectamos que você tem "Não Rastrear" ativado. Respeitamos sua preferência 
                    e não coletaremos dados analíticos.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={openPreferences}
                className="flex items-center gap-2"
                aria-label="Abrir preferências de cookies"
              >
                <Settings className="w-4 h-4" />
                Preferências
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={rejectAll}
                aria-label="Recusar cookies não essenciais"
              >
                Recusar
              </Button>
              
              <Button
                size="sm"
                onClick={acceptAll}
                aria-label="Aceitar todos os cookies"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Aceitar Todos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};