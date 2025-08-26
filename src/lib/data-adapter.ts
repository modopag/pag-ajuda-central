// Data adapter configuration and factory

import type { DataAdapter } from '@/types/admin';

// Feature flag for data backend
export const DATA_BACKEND: 'mock' | 'supabase' = 'mock';

let adapterInstance: DataAdapter | null = null;

export async function getDataAdapter(): Promise<DataAdapter> {
  if (adapterInstance) {
    return adapterInstance;
  }

  switch (DATA_BACKEND) {
    case 'mock':
      const { MockAdapter } = await import('./adapters/mock-adapter');
      adapterInstance = new MockAdapter();
      break;
    case 'supabase':
      // Future implementation
      const { SupabaseAdapter } = await import('./adapters/supabase-adapter');
      adapterInstance = new SupabaseAdapter();
      break;
    default:
      throw new Error(`Unknown data backend: ${DATA_BACKEND}`);
  }

  return adapterInstance;
}

// Reset adapter instance (useful for testing or switching backends)
export function resetAdapterInstance() {
  adapterInstance = null;
}