import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ValidationResult {
  field: string;
  type: 'success' | 'warning' | 'error';
  message: string;
}

interface SlugValidationResult {
  isValid: boolean;
  isChecking: boolean;
  isDuplicate: boolean;
  error?: string;
}

interface EditorTabsProps {
  activeTab: 'content' | 'seo' | 'faqs';
  onTabChange: (tab: 'content' | 'seo' | 'faqs') => void;
  seoValidations: ValidationResult[];
  slugValidation: SlugValidationResult;
  hasContentErrors?: boolean;
  hasUnsavedChanges?: boolean;
}

export function EditorTabs({ 
  activeTab, 
  onTabChange, 
  seoValidations, 
  slugValidation,
  hasContentErrors = false,
  hasUnsavedChanges = false
}: EditorTabsProps) {
  // Calculate validation status for each tab
  const contentStatus = hasContentErrors ? 'error' : 'success';
  
  const seoErrors = seoValidations.filter(v => v.type === 'error').length + (!slugValidation.isValid ? 1 : 0);
  const seoWarnings = seoValidations.filter(v => v.type === 'warning').length;
  const seoStatus = seoErrors > 0 ? 'error' : seoWarnings > 0 ? 'warning' : 'success';

  const getStatusIcon = (status: string, isChecking = false) => {
    if (isChecking) return <Clock className="w-3 h-3 animate-spin" />;
    
    switch (status) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusCount = (status: string, errors: number, warnings: number) => {
    if (status === 'error' && errors > 0) return errors;
    if (status === 'warning' && warnings > 0) return warnings;
    return null;
  };

  return (
    <div className="border-b border-border bg-card">
      <div className="flex space-x-1">
        {/* Content Tab */}
        <button
          className={cn(
            "relative px-6 py-4 font-medium text-sm transition-all duration-200 border-b-2 flex items-center gap-2",
            activeTab === 'content'
              ? "text-foreground border-primary bg-background"
              : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
          )}
          onClick={() => onTabChange('content')}
        >
          <span>Conteúdo</span>
          {getStatusIcon(contentStatus)}
          
          {hasUnsavedChanges && (
            <div className="absolute -top-1 -right-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            </div>
          )}
        </button>

        {/* SEO Tab */}
        <button
          className={cn(
            "relative px-6 py-4 font-medium text-sm transition-all duration-200 border-b-2 flex items-center gap-2",
            activeTab === 'seo'
              ? "text-foreground border-primary bg-background"
              : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
          )}
          onClick={() => onTabChange('seo')}
        >
          <span>SEO</span>
          {getStatusIcon(seoStatus, slugValidation.isChecking)}
          
          {/* Status badge */}
          {seoErrors > 0 && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-5">
              {seoErrors}
            </Badge>
          )}
          {seoErrors === 0 && seoWarnings > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5 bg-amber-100 text-amber-800 border-amber-200">
              {seoWarnings}
            </Badge>
          )}
        </button>

        {/* FAQs Tab */}
        <button
          className={cn(
            "relative px-6 py-4 font-medium text-sm transition-all duration-200 border-b-2 flex items-center gap-2",
            activeTab === 'faqs'
              ? "text-foreground border-primary bg-background"
              : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
          )}
          onClick={() => onTabChange('faqs')}
        >
          <span>FAQs do Artigo</span>
        </button>
      </div>
      
      {/* Tab content indicator */}
      <div className="px-6 py-2 text-xs text-muted-foreground border-t border-border/50">
        {activeTab === 'content' && (
          <div className="flex items-center gap-4">
            <span>Escreva e formate seu conteúdo</span>
            {hasUnsavedChanges && (
              <span className="text-amber-600 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                Alterações não salvas
              </span>
            )}
          </div>
        )}
        {activeTab === 'seo' && (
          <div className="flex items-center gap-4">
            <span>Configure SEO e metadados</span>
            {seoErrors > 0 && (
              <span className="text-red-600">{seoErrors} erro{seoErrors > 1 ? 's' : ''}</span>
            )}
            {seoErrors === 0 && seoWarnings > 0 && (
              <span className="text-amber-600">{seoWarnings} aviso{seoWarnings > 1 ? 's' : ''}</span>
            )}
            {seoErrors === 0 && seoWarnings === 0 && (
              <span className="text-emerald-600">Configuração válida</span>
            )}
          </div>
        )}
        {activeTab === 'faqs' && (
          <div className="flex items-center gap-4">
            <span>Gerencie as perguntas frequentes específicas deste artigo</span>
          </div>
        )}
      </div>
    </div>
  );
}