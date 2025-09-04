import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { HelmetProvider } from 'react-helmet-async';
import App from '../App';

export interface SSRContext {
  path: string;
  data?: any;
}

export function renderAppToString(context: SSRContext): string {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
      },
    },
  });

  // const helmetContext = {};

  const app = (
    // <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={context.path}>
          <App ssrData={context.data} />
        </StaticRouter>
      </QueryClientProvider>
    // </HelmetProvider>
  );

  return renderToString(app);
}
