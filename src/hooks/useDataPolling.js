import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for periodic data polling with optimized update detection
 */
const useDataPolling = (
  fetchFunction,
  pollingInterval = 60000,
  dependencies = [],
  enabled = true
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use useRef to store timer and previous data
  const timerRef = useRef(null);
  const previousDataRef = useRef(null);
  
  // Flag to track page visibility
  const isVisibleRef = useRef(true);
  const isMountedRef = useRef(true);
  
  // Last update time
  const lastUpdateTimeRef = useRef(0);
  const fetchInProgressRef = useRef(false);
  
  // Minimum interval between updates (5 seconds)
  const minimumUpdateInterval = 5000;

  // Improved data comparison function
  const isDataChanged = useCallback((oldData, newData) => {
    if (!oldData || !newData) return true;
    
    // For arrays (like items list)
    if (Array.isArray(oldData) && Array.isArray(newData)) {
      // Quick check: different lengths
      if (oldData.length !== newData.length) return true;
      
      // Create maps for efficient comparison
      const oldMap = new Map();
      const newMap = new Map();
      
      oldData.forEach(item => {
        if (item && item.id) {
          oldMap.set(item.id, item);
        }
      });
      
      newData.forEach(item => {
        if (item && item.id) {
          newMap.set(item.id, item);
        }
      });
      
      // Check if items are different
      if (oldMap.size !== newMap.size) return true;
      
      // Check each item for significant changes
      for (const [id, newItem] of newMap) {
        const oldItem = oldMap.get(id);
        if (!oldItem) return true; // New item
        
        // Only check significant fields for items
        const significantFields = [
          'current_price',
          'desired_price', 
          'title',
          'wildberries_id',
          'notification_sent'
        ];
        
        const hasChanges = significantFields.some(field => {
          const oldValue = oldItem[field];
          const newValue = newItem[field];
          
          // Handle numeric comparisons with small tolerance for floats
          if (typeof oldValue === 'number' && typeof newValue === 'number') {
            return Math.abs(oldValue - newValue) > 0.01;
          }
          
          return oldValue !== newValue;
        });
        
        if (hasChanges) return true;
      }
      
      return false;
    }
    
    // For objects (not arrays) - like user objects
    if (typeof oldData === 'object' && typeof newData === 'object') {
      // Create copies without timestamp fields
      const cleanOld = { ...oldData };
      const cleanNew = { ...newData };
      
      // Remove fields that change frequently but aren't significant
      const ignoredFields = ['last_checked', 'created_at', 'updated_at'];
      ignoredFields.forEach(field => {
        delete cleanOld[field];
        delete cleanNew[field];
      });
      
      // For user objects, check subscription fields specifically
      if ('subscription_active' in cleanOld || 'subscription_active' in cleanNew) {
        const significantUserFields = [
          'subscription_active',
          'subscription_end_date',
          'telegram_id',
          'username',
          'first_name',
          'items_count'
        ];
        
        return significantUserFields.some(field => cleanOld[field] !== cleanNew[field]);
      }
      
      // For other objects, do full comparison
      return JSON.stringify(cleanOld) !== JSON.stringify(cleanNew);
    }
    
    // For primitives
    return oldData !== newData;
  }, []);

  // Function to fetch data
  const fetchData = useCallback(async (force = false) => {
    // If fetch is already in progress, don't start a new one
    if (fetchInProgressRef.current) {
      console.log('Fetch already in progress, skipping');
      return;
    }
    
    // Check if enough time has passed since last update
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    
    // If less than minimum interval has passed and not forced - don't update
    if (!force && timeSinceLastUpdate < minimumUpdateInterval) {
      console.log(`Skipping update, last update was ${timeSinceLastUpdate}ms ago`);
      return;
    }
    
    fetchInProgressRef.current = true;
    
    try {
      // For first load show full loading indicator
      if (data === null || force) {
        setLoading(true);
      } else {
        // For subsequent loads show refresh indicator
        setIsRefreshing(true);
      }
      
      setError(null);
      
      const result = await fetchFunction();
      
      // If component is unmounted, don't update state
      if (!isMountedRef.current) return;
      
      // Update data only if page is visible or it's the first load
      if (isVisibleRef.current || data === null || force) {
        // Check if data has actually changed
        if (force || isDataChanged(previousDataRef.current, result)) {
          console.log('Data changed, updating state');
          setData(result);
          previousDataRef.current = result;
          setLastUpdated(new Date());
        } else {
          console.log('Data unchanged, skipping state update');
        }
        
        // Update last request time in any case
        lastUpdateTimeRef.current = now;
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Error fetching data');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
      fetchInProgressRef.current = false;
    }
  }, [fetchFunction, data, isDataChanged]);

  // Start polling on component mount and when dependencies change
  useEffect(() => {
    isMountedRef.current = true;
    
    // Track page visibility
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      isVisibleRef.current = isVisible;
      
      // If page becomes visible and data is stale, update data
      if (isVisible && enabled) {
        const timeSinceLastUpdate = Date.now() - lastUpdateTimeRef.current;
        // If more than 1 minute has passed, force an update
        if (timeSinceLastUpdate > pollingInterval) {
          fetchData(true);
        }
      }
    };
    
    // Handle when app comes into focus
    const handleFocus = () => {
      if (enabled && isVisibleRef.current) {
        const timeSinceLastUpdate = Date.now() - lastUpdateTimeRef.current;
        // If more than 30 seconds have passed, update data
        if (timeSinceLastUpdate > 30000) {
          fetchData(false);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Initial data load
    if (enabled) {
      fetchData(true);
    }
    
    // Setup interval for polling, only if enabled
    if (enabled && pollingInterval > 0) {
      timerRef.current = setInterval(() => {
        // Only poll if page is visible and not already fetching
        if (isVisibleRef.current && !fetchInProgressRef.current) {
          fetchData(false);
        }
      }, pollingInterval);
    }
    
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [...dependencies, enabled, pollingInterval]);

  // Force data refresh
  const refetch = useCallback(() => {
    console.log('Manual refetch requested');
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch,
    isRefreshing
  };
};

export default useDataPolling;
