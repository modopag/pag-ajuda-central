/**
 * Router context guards to prevent crashes when components
 * render outside Router context
 */

import { useInRouterContext } from 'react-router-dom';
import React from 'react';

/**
 * Hook to safely check if component is within Router context
 */
export function useRouterSafe() {
  try {
    return useInRouterContext();
  } catch {
    return false;
  }
}

/**
 * Safe navigation wrapper that only works within Router context
 */
export function useSafeNavigate() {
  const inRouter = useRouterSafe();
  
  if (!inRouter) {
    return (path: string) => {
      console.warn('Navigation attempted outside Router context, using window.location');
      window.location.href = path;
    };
  }
  
  // Only import useNavigate if we're in router context
  const { useNavigate } = require('react-router-dom');
  return useNavigate();
}

/**
 * Safe location hook that works outside Router context
 */
export function useSafeLocation() {
  const inRouter = useRouterSafe();
  
  if (!inRouter) {
    return {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      state: null,
      key: 'default'
    };
  }
  
  const { useLocation } = require('react-router-dom');
  return useLocation();
}

/**
 * Component wrapper that renders children only if Router context is available
 */
export function RouterSafeWrapper({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const inRouter = useRouterSafe();
  
  if (!inRouter) {
    return React.createElement(React.Fragment, null, fallback);
  }
  
  return React.createElement(React.Fragment, null, children);
}

/**
 * Console marker for debugging router context issues
 */
export function addRouterDebugMarker(componentName: string) {
  if (import.meta.env.DEV) {
    const inRouter = useRouterSafe();
    console.log(`[Router Debug] ${componentName} - In Router Context: ${inRouter}`);
  }
}