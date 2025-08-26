// Data adapter configuration and factory

import type { DataAdapter } from '@/types/admin';

// Feature flag for data backend
export const DATA_BACKEND: 'mock' | 'supabase' = 'supabase';

// Singleton with race condition protection
let adapterInstance: DataAdapter | null = null;
let adapterPromise: Promise<DataAdapter> | null = null;
let initializationId = 0;

export async function getDataAdapter(): Promise<DataAdapter> {
  // If already initialized, return immediately
  if (adapterInstance) {
    console.log('🔄 DataAdapter: Returning existing instance');
    return adapterInstance;
  }

  // If initialization is in progress, wait for it
  if (adapterPromise) {
    console.log('⏳ DataAdapter: Waiting for initialization to complete');
    return adapterPromise;
  }

  // Start initialization with unique ID for tracking
  const currentId = ++initializationId;
  console.log(`🚀 DataAdapter: Starting initialization #${currentId} (backend: ${DATA_BACKEND})`);

  adapterPromise = (async (): Promise<DataAdapter> => {
    try {
      let instance: DataAdapter;

      switch (DATA_BACKEND) {
        case 'mock':
          const { MockAdapter } = await import('./adapters/mock-adapter');
          instance = new MockAdapter();
          console.log(`✅ DataAdapter: MockAdapter initialized #${currentId}`);
          break;
        
        case 'supabase':
          const { SupabaseAdapter } = await import('./adapters/supabase-adapter');
          instance = new SupabaseAdapter();
          console.log(`✅ DataAdapter: SupabaseAdapter initialized #${currentId}`);
          break;
        
        default:
          throw new Error(`Unknown data backend: ${DATA_BACKEND}`);
      }

      // Set the singleton instance
      adapterInstance = instance;
      console.log(`🎯 DataAdapter: Singleton established #${currentId}`);
      
      return instance;

    } catch (error) {
      console.error(`❌ DataAdapter: Initialization failed #${currentId}:`, error);
      // Clear the promise on error so retry is possible
      adapterPromise = null;
      throw error;
    } finally {
      // Clear the promise after completion (success or failure)
      // But keep the instance if successful
      if (adapterInstance) {
        adapterPromise = null;
      }
    }
  })();

  return adapterPromise;
}

// Reset adapter instance (useful for testing or switching backends)
export function resetAdapterInstance() {
  const wasInitialized = adapterInstance !== null;
  adapterInstance = null;
  adapterPromise = null;
  if (wasInitialized) {
    console.log('🔄 DataAdapter: Singleton reset - next call will reinitialize');
  }
}