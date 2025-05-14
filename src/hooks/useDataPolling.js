import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for periodic data polling with limited update frequency
 * and checking for real data changes
 * 
 * @param {Function} fetchFunction - Function to fetch data
 * @param {number} pollingInterval - Polling interval in milliseconds (default 60000 ms = 60 seconds)
 * @param {Array} dependencies - Dependencies that should trigger re-polling when changed
 * @param {boolean} enabled - Flag to enable or disable polling
 * @returns {Object} - Object with data, loading state, and error
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
  
  // Minimum interval between updates (3 seconds)
  const minimumUpdateInterval = 3000;

  // Function to compare objects (ignoring last_checked and notification_sent)
  const isDataChanged = useCallback((oldData, newData) => {
    if (!oldData || !newData) return true;
    
    // For arrays (like items list)
    if (Array.isArray(oldData) && Array.isArray(newData)) {
      // Quick check: different lengths
      if (oldData.length !== newData.length) return true;
      
      // Check each item for significant changes
      return newData.some((newItem, index) => {
        const oldItem = oldData[index];
        
        // If these are items with id (products)
        if (newItem && oldItem && 'id' in newItem && 'id' in oldItem) {
          // If ids don't match or items are in different order, data has changed
          if (newItem.id !== oldItem.id) return true;
          
          // Check only important fields, ignore last_checked and notification_sent
          const significantFields = [
            'current_price',
            'desired_price', 
            'title',
            'wildberries_id'
          ];
          
          return significantFields.some(field => newItem[field] !== oldItem[field]);
        }
        
        // For non-item objects, do deep comparison excluding timestamps
        if (typeof newItem === 'object' && typeof oldItem === 'object') {
          const cleanOld = { ...oldItem };
          const cleanNew = { ...newItem };
          
          // Remove timestamp fields
          delete cleanOld.last_checked;
          delete cleanNew.last_checked;
          delete cleanOld.notification_sent;
          delete cleanNew.notification_sent;
          
          return JSON.stringify(cleanOld) !== JSON.stringify(cleanNew);
        }
        
        // For primitives use simple comparison
        return newItem !== oldItem;
      });
    }
    
    // For objects (not arrays)
    if (typeof oldData === 'object' && typeof newData === 'object') {
      // Create copies without timestamp fields
      const oldDataCopy = { ...oldData };
      const newDataCopy = { ...newData };
      
      // Remove fields that change frequently but aren't significant
      delete oldDataCopy.last_checked;
      delete newDataCopy.last_checked;
      delete oldDataCopy.notification_sent;
      delete newDataCopy.notification_sent;
      
      // For user objects, check subscription fields specifically
      if ('subscription_active' in oldDataCopy && 'subscription_active' in newDataCopy) {
        const significantFields = [
          'subscription_active',
          'subscription_end_date',
          'telegram_id',
          'username',
          'first_name'
        ];
        
        return significantFields.some(field => oldDataCopy[field] !== newDataCopy[field]);
      }
      
      return JSON.stringify(oldDataCopy) !== JSON.stringify(newDataCopy);
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
      if (data === null) {
        setLoading(true);
      } else {
        // For subsequent loads show refresh indicator
        setIsRefreshing(true);
      }
      
      setError(null);
      
      const result = await fetchFunction();
      
      // If component is unmounted, don't update state
      if (!isMountedRef.current) return;
      
      // Update data only if page is visible and data has changed
      if (isVisibleRef.current || data === null) {
        // Check if data has actually changed
        if (isDataChanged(previousDataRef.current, result)) {
          console.log('Data changed, updating state');
          setData(result);
          previousDataRef.current = result;
          setLastUpdated(new Date());
        } else {
          console.log('Data did not change, skipping update');
        }
        
        // Update last request time in any case
        lastUpdateTimeRef.current = Date.now();
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
      
      // If page becomes visible and hasn't been updated in a while, update data
      if (isVisible && enabled) {
        const timeSinceLastUpdate = Date.now() - lastUpdateTimeRef.current;
        // If more than 30 seconds have passed, force an update
        if (timeSinceLastUpdate > 30000) {
          fetchData(true);
        }
      }
    };
    
    // Handle when app comes into focus
    const handleFocus = () => {
      if (enabled && isVisibleRef.current) {
        const timeSinceLastUpdate = Date.now() - lastUpdateTimeRef.current;
        // If more than 10 seconds have passed, force an update
        if (timeSinceLastUpdate > 10000) {
          fetchData(true);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Initial data load
    if (enabled) {
      fetchData();
    }
    
    // Setup interval for polling, only if enabled
    if (enabled) {
      timerRef.current = setInterval(() => {
        // Check if page is visible or if it's the first load
        if (isVisibleRef.current || data === null) {
          fetchData();
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
  }, [...dependencies, enabled, pollingInterval, fetchData]);

  // Force data refresh
  const refetch = useCallback(() => {
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
