import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
<<<<<<< HEAD
#import { HelmetProvider } from 'react-helmet-async';
=======
// import { HelmetProvider } from 'react-helmet-async';
>>>>>>> 04e9ab1f742a3c80e3aa975b01758bc4c5a05d67
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

<<<<<<< HEAD
  #const helmetContext = {};

  const app = (
    #<HelmetProvider context={helmetContext}>
=======
  // const helmetContext = {};

  const app = (
    // <HelmetProvider context={helmetContext}>
>>>>>>> 04e9ab1f742a3c80e3aa975b01758bc4c5a05d67
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={context.path}>
          <App ssrData={context.data} />
        </StaticRouter>
      </QueryClientProvider>
<<<<<<< HEAD
    #</HelmetProvider>
=======
    // </HelmetProvider>
>>>>>>> 04e9ab1f742a3c80e3aa975b01758bc4c5a05d67
  );

  return renderToString(app);
}
