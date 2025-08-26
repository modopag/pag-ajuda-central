import { useEffect, useCallback, useRef } from 'react';

interface KeyboardNavigationOptions {
  enableFocusTrap?: boolean;
  enableArrowNavigation?: boolean;
  focusableSelectors?: string[];
  onEscape?: () => void;
}

/**
 * Enhanced keyboard navigation hook for better accessibility
 */
export const useKeyboardNavigation = (options: KeyboardNavigationOptions = {}) => {
  const {
    enableFocusTrap = false,
    enableArrowNavigation = false,
    focusableSelectors = [
      'button',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]'
    ],
    onEscape
  } = options;

  const containerRef = useRef<HTMLElement | null>(null);
  const focusableElements = useRef<NodeListOf<HTMLElement> | null>(null);
  const currentFocusIndex = useRef<number>(0);

  // Get all focusable elements within container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return null;
    
    const selector = focusableSelectors.join(', ');
    const elements = containerRef.current.querySelectorAll<HTMLElement>(selector);
    
    // Filter out hidden elements
    const visibleElements = Array.from(elements).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             !el.hasAttribute('disabled') &&
             el.offsetParent !== null;
    });

    return visibleElements.length > 0 ? 
           containerRef.current.querySelectorAll<HTMLElement>(
             visibleElements.map(el => `#${el.id || el.tagName.toLowerCase()}`).join(', ')
           ) : null;
  }, [focusableSelectors]);

  // Focus trap implementation
  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (!enableFocusTrap || !focusableElements.current) return;

    const firstElement = focusableElements.current[0];
    const lastElement = focusableElements.current[focusableElements.current.length - 1];

    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab (forward)
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [enableFocusTrap]);

  // Arrow key navigation
  const handleArrowKeys = useCallback((event: KeyboardEvent) => {
    if (!enableArrowNavigation || !focusableElements.current) return;

    const { key } = event;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) return;

    event.preventDefault();
    
    const currentElement = document.activeElement as HTMLElement;
    const currentIndex = Array.from(focusableElements.current).indexOf(currentElement);
    
    if (currentIndex === -1) return;

    const totalElements = focusableElements.current.length;
    let nextIndex = currentIndex;

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % totalElements;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + totalElements) % totalElements;
        break;
    }

    focusableElements.current[nextIndex].focus();
    currentFocusIndex.current = nextIndex;
  }, [enableArrowNavigation]);

  // Handle escape key
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && onEscape) {
      event.preventDefault();
      onEscape();
    }
  }, [onEscape]);

  // Main keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Tab':
        handleTabKey(event);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        handleArrowKeys(event);
        break;
      case 'Escape':
        handleEscapeKey(event);
        break;
    }
  }, [handleTabKey, handleArrowKeys, handleEscapeKey]);

  // Initialize keyboard navigation
  const initializeNavigation = useCallback((container: HTMLElement) => {
    containerRef.current = container;
    focusableElements.current = getFocusableElements();
    
    if (focusableElements.current && focusableElements.current.length > 0) {
      // Focus first element if none is focused
      if (!container.contains(document.activeElement)) {
        focusableElements.current[0].focus();
      }
    }
  }, [getFocusableElements]);

  // Set up event listeners
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Update focusable elements when container changes
  useEffect(() => {
    if (containerRef.current) {
      focusableElements.current = getFocusableElements();
    }
  }, [getFocusableElements]);

  // Focus management utilities
  const focusFirst = useCallback(() => {
    if (focusableElements.current && focusableElements.current.length > 0) {
      focusableElements.current[0].focus();
      currentFocusIndex.current = 0;
    }
  }, []);

  const focusLast = useCallback(() => {
    if (focusableElements.current && focusableElements.current.length > 0) {
      const lastIndex = focusableElements.current.length - 1;
      focusableElements.current[lastIndex].focus();
      currentFocusIndex.current = lastIndex;
    }
  }, []);

  const focusNext = useCallback(() => {
    if (focusableElements.current && focusableElements.current.length > 0) {
      const nextIndex = (currentFocusIndex.current + 1) % focusableElements.current.length;
      focusableElements.current[nextIndex].focus();
      currentFocusIndex.current = nextIndex;
    }
  }, []);

  const focusPrevious = useCallback(() => {
    if (focusableElements.current && focusableElements.current.length > 0) {
      const prevIndex = (currentFocusIndex.current - 1 + focusableElements.current.length) % 
                       focusableElements.current.length;
      focusableElements.current[prevIndex].focus();
      currentFocusIndex.current = prevIndex;
    }
  }, []);

  return {
    initializeNavigation,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    containerRef,
  };
};