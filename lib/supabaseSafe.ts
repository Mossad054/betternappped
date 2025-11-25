import { supabase } from './supabase';
import { Database } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for safe operations
export interface SafeResult<T = any> {
  success: boolean;
  data?: T;
  error?: any;
  needsVerification?: boolean;
}

export interface PendingWrite {
  id: string;
  op: 'insert' | 'update' | 'delete';
  table: string;
  payload: any;
  attempts: number;
  createdAt: string;
}

// Exponential backoff delay calculation
const getDelay = (attempt: number): number => {
  return Math.min(300 * Math.pow(2, attempt), 5000); // Max 5 seconds
};

// Sleep utility for delays
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Logging utility
const logOperation = (operation: string, success: boolean, error?: any, data?: any) => {
  if (__DEV__) {
    if (success) {
      console.log(`✅ SupabaseSafe ${operation}:`, data);
    } else {
      console.error(`❌ SupabaseSafe ${operation}:`, error);
    }
  }
};

// Retry wrapper for operations
const withRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  maxAttempts: number = 3
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await operation();
      logOperation(operationName, true, undefined, result);
      return result;
    } catch (error) {
      lastError = error;
      logOperation(operationName, false, error);
      
      if (attempt < maxAttempts - 1) {
        const delay = getDelay(attempt);
        console.log(`🔄 Retrying ${operationName} in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
};

// Safe Insert operation
export const safeInsert = async <T>(
  table: string,
  payload: any,
  userId?: string
): Promise<SafeResult<T>> => {
  try {
    const dataToInsert = userId ? { ...payload, user_id: userId } : payload;
    
    const result = await withRetry(async () => {
      const { data, error } = await supabase
        .from(table)
        .insert(dataToInsert)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }, `INSERT ${table}`);

    return { success: true, data: result };
  } catch (error) {
    // Add to offline queue if network error
    if (isNetworkError(error)) {
      await addToOfflineQueue('insert', table, payload);
    }
    
    return { 
      success: false, 
      error: sanitizeError(error),
      data: undefined 
    };
  }
};

// Safe Select operation
export const safeSelect = async <T>(
  table: string,
  query?: any,
  userId?: string
): Promise<SafeResult<T[]>> => {
  try {
    const result = await withRetry(async () => {
      let supabaseQuery = supabase.from(table).select('*');
      
      if (userId) {
        supabaseQuery = supabaseQuery.eq('user_id', userId);
      }
      
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (key === 'eq' && typeof value === 'object' && value !== null) {
            // Handle multiple eq conditions: { eq: { id: '123', status: 'active' } }
            Object.entries(value).forEach(([eqKey, eqValue]) => {
              supabaseQuery = supabaseQuery.eq(eqKey, eqValue);
            });
          } else if (key === 'gte' && typeof value === 'object' && value !== null) {
            // Handle gte conditions: { gte: { date: '2023-01-01' } }
            Object.entries(value).forEach(([gteKey, gteValue]) => {
              supabaseQuery = supabaseQuery.gte(gteKey, gteValue);
            });
          } else if (key === 'lte' && typeof value === 'object' && value !== null) {
            // Handle lte conditions: { lte: { date: '2023-12-31' } }
            Object.entries(value).forEach(([lteKey, lteValue]) => {
              supabaseQuery = supabaseQuery.lte(lteKey, lteValue);
            });
          } else if (key === 'order' && typeof value === 'object' && value !== null) {
            // Handle order conditions: { order: { date: 'desc' } }
            Object.entries(value).forEach(([orderKey, orderValue]) => {
              supabaseQuery = supabaseQuery.order(orderKey, { ascending: orderValue === 'asc' });
            });
          } else if (key === 'limit' && typeof value === 'number') {
            // Handle limit: { limit: 10 }
            supabaseQuery = supabaseQuery.limit(value);
          } else if (key !== 'eq' && key !== 'gte' && key !== 'lte' && key !== 'order' && key !== 'limit') {
            // Handle direct field conditions: { status: 'active' }
            supabaseQuery = supabaseQuery.eq(key, value);
          }
        });
      }
      
      const { data, error } = await supabaseQuery;
      if (error) throw error;
      return data;
    }, `SELECT ${table}`);

    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: sanitizeError(error),
      data: undefined 
    };
  }
};

// Safe Update operation
export const safeUpdate = async <T>(
  table: string,
  id: string,
  payload: any,
  userId?: string
): Promise<SafeResult<T>> => {
  try {
    let supabaseQuery = supabase.from(table).update(payload).eq('id', id);
    
    if (userId) {
      supabaseQuery = supabaseQuery.eq('user_id', userId);
    }
    
    const { data, error } = await supabaseQuery.select().single();
    
    // Don't retry if row doesn't exist (PGRST116) - this is expected on first use
    if (error) {
      if ((error as any).code === 'PGRST116') {
        logOperation(`UPDATE ${table}`, false, error);
        return { 
          success: false, 
          error: sanitizeError(error),
          data: undefined 
        };
      }
      throw error;
    }
    
    logOperation(`UPDATE ${table}`, true, undefined, data);
    return { success: true, data };
  } catch (error) {
    // Add to offline queue if network error
    if (isNetworkError(error)) {
      await addToOfflineQueue('update', table, { id, ...payload });
    }
    
    logOperation(`UPDATE ${table}`, false, error);
    return { 
      success: false, 
      error: sanitizeError(error),
      data: undefined 
    };
  }
};

// Safe Delete operation
export const safeDelete = async (
  table: string,
  id: string,
  userId?: string
): Promise<SafeResult<void>> => {
  try {
    await withRetry(async () => {
      let supabaseQuery = supabase.from(table).delete().eq('id', id);
      
      if (userId) {
        supabaseQuery = supabaseQuery.eq('user_id', userId);
      }
      
      const { error } = await supabaseQuery;
      if (error) throw error;
    }, `DELETE ${table}`);

    return { success: true };
  } catch (error) {
    // Add to offline queue if network error
    if (isNetworkError(error)) {
      await addToOfflineQueue('delete', table, { id });
    }
    
    return { 
      success: false, 
      error: sanitizeError(error)
    };
  }
};

// Safe Auth Sign Up
export const safeAuthSignUp = async (
  email: string,
  password: string
): Promise<SafeResult<{ user: any; session: any }>> => {
  try {
    const result = await withRetry(async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      // The database trigger on auth.users (handle_new_user) will create rows in
      // `public.users`, `public.profiles`, and default preferences. Avoid attempting
      // to insert from the client here because signUp may not return an authenticated
      // session (email confirmation required). Client-side insert attempts without a
      // valid JWT are blocked by RLS and cause "Database error saving new user".
      //
      // If you need server-side inserts here, perform them from a secure server using
      // the service_role key. For client flows, rely on the DB trigger or wait for an
      // authenticated session before writing protected tables.
      
      return data;
    }, 'AUTH_SIGNUP');

    return { 
      success: true, 
      data: result,
      needsVerification: !result.user?.email_confirmed_at
    };
  } catch (error) {
    return { 
      success: false, 
      error: sanitizeError(error),
      needsVerification: false
    };
  }
};

// Safe Auth Sign In
export const safeAuthSignIn = async (
  email: string,
  password: string
): Promise<SafeResult<{ user: any; session: any }>> => {
  try {
    const result = await withRetry(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return data;
    }, 'AUTH_SIGNIN');

    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: sanitizeError(error)
    };
  }
};

// Safe Auth Sign Out
export const safeAuthSignOut = async (): Promise<SafeResult<void>> => {
  try {
    await withRetry(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }, 'AUTH_SIGNOUT');

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: sanitizeError(error)
    };
  }
};

// Offline Queue Management
const OFFLINE_QUEUE_KEY = '@pending_writes';

export const addToOfflineQueue = async (
  op: 'insert' | 'update' | 'delete',
  table: string,
  payload: any
): Promise<void> => {
  try {
    const queue = await getOfflineQueue();
    const pendingWrite: PendingWrite = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      op,
      table,
      payload,
      attempts: 0,
      createdAt: new Date().toISOString()
    };
    
    queue.push(pendingWrite);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    
    if (__DEV__) {
      console.log(`📝 Added to offline queue: ${op} ${table}`, payload);
    }
  } catch (error) {
    console.error('Failed to add to offline queue:', error);
  }
};

export const getOfflineQueue = async (): Promise<PendingWrite[]> => {
  try {
    const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Failed to get offline queue:', error);
    return [];
  }
};

export const flushOfflineQueue = async (): Promise<{ success: number; failed: number }> => {
  const queue = await getOfflineQueue();
  let success = 0;
  let failed = 0;
  
  for (const write of queue) {
    try {
      let result: SafeResult;
      
      switch (write.op) {
        case 'insert':
          result = await safeInsert(write.table, write.payload);
          break;
        case 'update':
          result = await safeUpdate(write.table, write.payload.id, write.payload);
          break;
        case 'delete':
          result = await safeDelete(write.table, write.payload.id);
          break;
        default:
          failed++;
          continue;
      }
      
      if (result.success) {
        success++;
        // Remove from queue
        await removeFromOfflineQueue(write.id);
      } else {
        failed++;
        // Increment attempts
        write.attempts++;
        if (write.attempts >= 3) {
          // Remove after max attempts
          await removeFromOfflineQueue(write.id);
        } else {
          // Update attempts count
          await updateOfflineQueueItem(write);
        }
      }
    } catch (error) {
      failed++;
      console.error(`Failed to flush offline write:`, error);
    }
  }
  
  return { success, failed };
};

const removeFromOfflineQueue = async (id: string): Promise<void> => {
  try {
    const queue = await getOfflineQueue();
    const filteredQueue = queue.filter(write => write.id !== id);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filteredQueue));
  } catch (error) {
    console.error('Failed to remove from offline queue:', error);
  }
};

const updateOfflineQueueItem = async (write: PendingWrite): Promise<void> => {
  try {
    const queue = await getOfflineQueue();
    const updatedQueue = queue.map(w => w.id === write.id ? write : w);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
  } catch (error) {
    console.error('Failed to update offline queue item:', error);
  }
};

export const getOfflineQueueSize = async (): Promise<number> => {
  const queue = await getOfflineQueue();
  return queue.length;
};

// Utility functions
const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code || '';
  
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('timeout') ||
    errorCode === 'NETWORK_ERROR' ||
    errorCode === 'TIMEOUT' ||
    error.status === 502 ||
    error.status === 503 ||
    error.status === 504
  );
};

const sanitizeError = (error: any): any => {
  if (__DEV__) {
    return error;
  }
  
  // In production, only return safe error information
  return {
    message: error.message || 'An error occurred',
    code: error.code || 'UNKNOWN_ERROR'
  };
};

// Export all safe operations
export const SupabaseSafe = {
  insert: safeInsert,
  select: safeSelect,
  update: safeUpdate,
  delete: safeDelete,
  authSignUp: safeAuthSignUp,
  authSignIn: safeAuthSignIn,
  authSignOut: safeAuthSignOut,
  addToOfflineQueue,
  getOfflineQueue,
  flushOfflineQueue,
  getOfflineQueueSize
};


