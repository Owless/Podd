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
  
  // Minimum interval between updates (5 seconds)
  const minimumUpdateInterval = 5000;

  // Function to compare objects (ignoring last_checked)
  const isDataChanged = useCallback((oldData, newData) => {
    if (!oldData || !newData) return true;
    
    // For arrays
    if (Array.isArray(oldData) && Array.isArray(newData)) {
      if (oldData.length !== newData.length) return true;
      
      // Check each item for significant changes
      return newData.some((newItem, index) => {
        const oldItem = oldData[index];
        
        // If these are items with id (products)
        if (newItem && oldItem && 'id' in newItem && 'id' in oldItem) {
          // If ids don't match, data has changed
          if (newItem.id !== oldItem.id) return true;
          
          // Check only important fields, ignore last_checked
          return (
            newItem.current_price !== oldItem.current_price ||
            newItem.desired_price !== oldItem.desired_price ||
            newItem.notification_sent !== oldItem.notification_sent ||
            newItem.title !== oldItem.title
          );
        }
        
        // For other elements use simple comparison
        return JSON.stringify(oldItem) !== JSON.stringify(newItem);
      });
    }
    
    // For objects (not arrays)
    if (typeof oldData === 'object' && typeof newData === 'object') {
      // Ignore last_checked field when comparing
      const oldDataCopy = { ...oldData };
      const newDataCopy = { ...newData };
      
      if ('last_checked' in oldDataCopy) delete oldDataCopy.last_checked;
      if ('last_checked' in newDataCopy) delete newDataCopy.last_checked;
      
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
      if (isVisibleRef.current) {
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
      isVisibleRef.current = document.visibilityState === 'visible';
      
      // If page becomes visible, update data immediately
      if (isVisibleRef.current && enabled) {
        fetchData(true); // Force update when returning to page
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initial data load
    if (enabled) {
      fetchData();
    }
    
    // Setup interval for polling, only if enabled
    if (enabled) {
      timerRef.current = setInterval(() => {
        // Check if page is visible
        if (isVisibleRef.current) {
          fetchData();
        }
      }, pollingInterval);
    }
    
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
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
