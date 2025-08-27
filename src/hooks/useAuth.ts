import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  name: string | null;
  email?: string | null;
  role: 'admin' | 'editor' | 'pending';
  status: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; data?: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null; data?: any; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null; data?: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null; data?: any }>;
  resendConfirmation: (email: string) => Promise<{ error: Error | null; data?: any }>;
  isAdmin: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Quick check for existing session to optimize loading state
  const hasStoredSession = localStorage.getItem('sb-sqroxesqxyzyxzywkybc-auth-token') !== null;
  const [loading, setLoading] = useState(hasStoredSession);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile loading to prevent deadlocks
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              setProfile(profile);
            } catch (error) {
              console.error('Error loading profile:', error);
              setProfile(null);
            }
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            setProfile(profile);
          } catch (error) {
            console.error('Error loading profile:', error);
            setProfile(null);
          }
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔐 Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Sign in error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        // Enhanced error messages
        let userFriendlyMessage = error.message;
        if (error.message === 'Invalid login credentials') {
          userFriendlyMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
        } else if (error.message === 'Email not confirmed') {
          userFriendlyMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
        } else if (error.message === 'Too many requests') {
          userFriendlyMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
        }
        
        return { error: { ...error, message: userFriendlyMessage } };
      }
      
      // Check if user is approved to login
      if (data.user) {
        try {
          const { data: canLogin } = await supabase.rpc('can_user_login', { 
            user_id: data.user.id 
          });
          
          if (!canLogin) {
            // Sign out the user immediately
            await supabase.auth.signOut();
            return { 
              error: { 
                message: 'Sua conta está aguardando aprovação do administrador. Você receberá um email quando sua conta for aprovada.',
                name: 'ACCOUNT_PENDING_APPROVAL',
                status: 403
              } as Error 
            };
          }
        } catch (approvalError) {
          console.error('Error checking approval status:', approvalError);
          // If we can't check approval, allow login for now but log the issue
        }
      }
      
      console.log('✅ Sign in successful for:', data.user?.email);
      return { error: null, data };
    } catch (error) {
      console.error('💥 Unexpected sign in error:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      console.log('📝 Attempting sign up for:', email);
      
      const redirectUrl = `https://ajuda.modopag.com.br/auth/email-confirmation`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: name ? { name } : undefined,
        },
      });
      
      if (error) {
        console.error('❌ Sign up error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        // Enhanced error messages
        let userFriendlyMessage = error.message;
        if (error.message === 'User already registered') {
          userFriendlyMessage = 'Este email já está cadastrado. Tente fazer login ou redefinir a senha.';
        } else if (error.message.includes('Password')) {
          userFriendlyMessage = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (error.message.includes('email')) {
          userFriendlyMessage = 'Email inválido. Verifique o formato do email.';
        }
        
        return { error: { ...error, message: userFriendlyMessage } };
      }
      
      console.log('✅ Sign up successful - confirmation email sent to:', email);
      return { error: null, data, needsConfirmation: !data.session };
    } catch (error) {
      console.error('💥 Unexpected sign up error:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Clean up any stored auth state
      localStorage.removeItem('supabase.auth.token');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Force reload even if signOut fails
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔄 Attempting password reset for:', email);
      
      const redirectUrl = `https://ajuda.modopag.com.br/auth/reset-password`;
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error('❌ Password reset error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        // Enhanced error messages
        let userFriendlyMessage = error.message;
        if (error.message === 'User not found') {
          userFriendlyMessage = 'Email não encontrado. Verifique o endereço digitado.';
        } else if (error.message.includes('rate limit')) {
          userFriendlyMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
        }
        
        return { error: { ...error, message: userFriendlyMessage } };
      }
      
      console.log('✅ Password reset email sent to:', email);
      return { error: null, data };
    } catch (error) {
      console.error('💥 Unexpected password reset error:', error);
      return { error: error as Error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      console.log('🔄 Attempting password update');
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('❌ Password update error:', error);
        return { error };
      }
      
      console.log('✅ Password updated successfully');
      return { error: null, data };
    } catch (error) {
      console.error('💥 Unexpected password update error:', error);
      return { error: error as Error };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      console.log('📧 Resending confirmation email to:', email);
      
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `https://ajuda.modopag.com.br/auth/confirm`
        }
      });
      
      if (error) {
        console.error('❌ Resend confirmation error:', error);
        return { error };
      }
      
      console.log('✅ Confirmation email resent');
      return { error: null, data };
    } catch (error) {
      console.error('💥 Unexpected resend error:', error);
      return { error: error as Error };
    }
  };

  const isAdmin = () => {
    return profile?.role === 'admin' && profile?.status === 'approved';
  };

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmation,
    isAdmin,
  };
};