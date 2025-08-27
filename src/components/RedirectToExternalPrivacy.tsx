import { useEffect } from 'react';

/**
 * Redirect component for the old internal privacy policy route
 * Redirects to the official external privacy policy page
 */
export default function RedirectToExternalPrivacy() {
  useEffect(() => {
    // Redirect to official privacy policy with proper SEO status
    window.location.replace('https://modopag.com.br/politicas-de-privacidade/');
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          Redirecionando para nossa Política de Privacidade...
        </p>
      </div>
    </div>
  );
}