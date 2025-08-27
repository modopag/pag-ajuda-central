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
      
      // Check if there's an access_token in the hash
      if (hash && hash.includes('access_token=')) {
        console.log('🔗 Detected auth token in hash fragment');
        
        try {
          // Get the current session after the token is processed
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Error processing auth token:', error);
            toast.error('Erro ao processar confirmação de email');
            navigate('/auth');
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
            navigate('/auth');
          }
        } catch (err) {
          console.error('💥 Unexpected error processing auth token:', err);
          toast.error('Erro inesperado ao processar confirmação');
          navigate('/auth');
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