import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Component that handles auth tokens in URL hash fragments
 * This is needed when Supabase redirects to localhost:3000/#access_token=...
 */
export const HashFragmentHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleHashFragment = async () => {
      const hash = window.location.hash;
      const currentPath = window.location.pathname;
      
      // Check if there's an access_token in the hash
      if (hash && hash.includes('access_token=')) {
        console.log('🔗 Detected auth token in hash fragment');
        
        // If we're on the password reset page, let that page handle the tokens
        if (currentPath === '/auth/reset-password') {
          console.log('📄 Password reset page will handle the tokens');
          return;
        }
        
        // If hash contains errors, redirect to error page
        if (hash.includes('error=') || hash.includes('error_description=')) {
          console.log('❌ Auth error found in hash:', hash);
          // Preserve error parameters for the error page
          const errorParams = new URLSearchParams(hash.substring(1));
          const errorPageUrl = `/auth/error?${errorParams.toString()}`;
          window.location.href = errorPageUrl;
          return;
        }
        
        try {
          // Get the current session after the token is processed
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Error processing auth token:', error);
            toast.error('Erro ao processar confirmação de email');
            navigate('/auth/error?error=session_error&error_description=' + encodeURIComponent(error.message));
            return;
          }
          
          if (session) {
            console.log('✅ Successfully processed auth token');
            toast.success('Email confirmado com sucesso!');
            
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            
            // Redirect to confirmation success page
            navigate('/auth/confirm');
          } else {
            console.log('⚠️ No session found after processing token');
            navigate('/auth/error?error=no_session&error_description=Nenhuma sessão encontrada após processar o token');
          }
        } catch (err) {
          console.error('💥 Unexpected error processing auth token:', err);
          toast.error('Erro inesperado ao processar confirmação');
          navigate('/auth/error?error=unexpected_error&error_description=Erro inesperado ao processar token');
        }
      }
    };

    // Run on mount
    handleHashFragment();

    // Also listen for hash changes
    const handleHashChange = () => {
      handleHashFragment();
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [navigate]);

  return null; // This component doesn't render anything
};