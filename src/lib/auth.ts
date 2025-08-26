// Simple authentication for admin panel (mock implementation)

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
}

const ADMIN_CREDENTIALS = {
  email: 'admin@modopag.com.br',
  password: 'admin123',
  user: {
    id: 'admin-1',
    name: 'Administrador',
    email: 'admin@modopag.com.br',
    role: 'admin' as const,
  },
};

const STORAGE_KEY = 'modopag_admin_auth';

export class AuthService {
  static async login(email: string, password: string): Promise<AdminUser> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const token = btoa(JSON.stringify(ADMIN_CREDENTIALS.user));
      localStorage.setItem(STORAGE_KEY, token);
      return ADMIN_CREDENTIALS.user;
    }
    
    throw new Error('Credenciais inválidas');
  }

  static async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }

  static getCurrentUser(): AdminUser | null {
    try {
      const token = localStorage.getItem(STORAGE_KEY);
      if (!token) return null;
      
      return JSON.parse(atob(token));
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static async resetPassword(email: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === ADMIN_CREDENTIALS.email) {
      // In real implementation, send email
      console.log('Password reset email sent to:', email);
    } else {
      throw new Error('E-mail não encontrado');
    }
  }
}