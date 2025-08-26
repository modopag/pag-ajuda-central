import { AuthService } from '@/lib/auth';
import type { UserRole, ArticleStatus } from '@/types/admin';

// Check if user can perform specific actions based on role
export const canUserPerformAction = (action: string, userRole?: UserRole): boolean => {
  if (!userRole) return false;

  const permissions = {
    admin: ['create', 'edit', 'delete', 'publish', 'review', 'manage_users', 'manage_settings'],
    editor: ['create', 'edit', 'delete', 'publish', 'review'],
    author: ['create', 'edit_own', 'review_submit'],
    viewer: ['view']
  };

  return permissions[userRole]?.includes(action) || false;
};

// Check if user can change article status
export const canUserChangeStatus = (
  currentStatus: ArticleStatus,
  newStatus: ArticleStatus,
  userRole?: UserRole,
  isOwner?: boolean
): boolean => {
  if (!userRole) return false;

  switch (userRole) {
    case 'admin':
    case 'editor':
      return true; // Can change any status
    
    case 'author':
      // Authors can only work with drafts and submit for review
      if (currentStatus === 'draft' && (newStatus === 'draft' || newStatus === 'review')) {
        return isOwner || false;
      }
      return false;
    
    case 'viewer':
      return false; // Cannot change status
    
    default:
      return false;
  }
};

// Get available status transitions for user
export const getAvailableStatusTransitions = (
  currentStatus: ArticleStatus,
  userRole?: UserRole,
  isOwner?: boolean
): ArticleStatus[] => {
  if (!userRole) return [];

  const allStatuses: ArticleStatus[] = ['draft', 'review', 'published', 'archived'];
  
  return allStatuses.filter(status => 
    canUserChangeStatus(currentStatus, status, userRole, isOwner)
  );
};

// Get current user role
export const getCurrentUserRole = (): UserRole | null => {
  const user = AuthService.getCurrentUser();
  return user?.role || null;
};

// Check if user owns the article
export const isArticleOwner = (articleAuthor: string): boolean => {
  const currentUser = AuthService.getCurrentUser();
  return currentUser?.name === articleAuthor || currentUser?.email === articleAuthor;
};

// Get user display name
export const getUserDisplayName = (): string => {
  const user = AuthService.getCurrentUser();
  return user?.name || user?.email || 'Usuário';
};

// Role-based UI helpers
export const getRoleColor = (role: UserRole): string => {
  const colors = {
    admin: 'bg-red-100 text-red-800',
    editor: 'bg-blue-100 text-blue-800',
    author: 'bg-green-100 text-green-800',
    viewer: 'bg-gray-100 text-gray-800'
  };
  
  return colors[role] || colors.viewer;
};

export const getRoleLabel = (role: UserRole): string => {
  const labels = {
    admin: 'Administrador',
    editor: 'Editor',
    author: 'Autor',
    viewer: 'Visualizador'
  };
  
  return labels[role] || 'Usuário';
};