import { useCallback } from 'react';

interface SkipLinkProps {
  targetId?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Skip navigation link for keyboard users and screen readers
 */
export const SkipLink = ({ 
  targetId = 'main-content', 
  className = '',
  children = 'Pular para conteúdo principal'
}: SkipLinkProps) => {
  const handleSkip = useCallback((event: React.KeyboardEvent | React.MouseEvent) => {
    event.preventDefault();
    
    const target = document.getElementById(targetId);
    if (target) {
      // Set focus to target element
      target.focus();
      
      // Ensure the target is scrolled into view
      target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });

      // Make sure the target is focusable
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }

      // Announce to screen readers
      const announcement = document.getElementById('accessibility-announcements');
      if (announcement) {
        announcement.textContent = `Navegação pulada para ${target.getAttribute('aria-label') || 'conteúdo principal'}`;
      }
    }
  }, [targetId]);

  return (
    <a
      href={`#${targetId}`}
      className={`
        absolute left-0 top-0 z-50 px-4 py-2 
        bg-primary text-primary-foreground 
        font-medium rounded-br-lg
        transform -translate-y-full focus:translate-y-0
        transition-transform duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-ring
        skip-link
        ${className}
      `}
      onClick={handleSkip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleSkip(e);
        }
      }}
    >
      {children}
    </a>
  );
};