import { createContext, useState, useEffect, useContext } from 'react';
import WebApp from '@twa-dev/sdk';
import { initUser, getUserInfo } from '../services/api';

export const AppContext = createContext(null);

export const useAppState = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referralCode, setReferralCode] = useState(null);
  const isDevMode = import.meta.env.DEV;

  // Extract referral code from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      setReferralCode(refCode);
      
      // Optionally: remove the ref parameter from URL for cleanliness
      const newUrl = window.location.pathname + 
        (urlParams.toString() ? 
          '?' + urlParams.toString().replace(/ref=[^&]*&?/, '') : 
          '');
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Initialize user
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        
        // In development mode use test data
        if (isDevMode) {
          const payload = {
            dev_mode: true,
            telegram_id: 123456789,
            username: 'test_user',
            first_name: 'Test User'
          };
          
          // Add referral code if present
          if (referralCode) {
            payload.referral_code = referralCode;
          }
          
          const response = await initUser(payload);
          
          if (response.success) {
            setUser(response.user);
          } else {
            setError(response.error || 'Failed to initialize user');
          }
        } else {
          // In production use data from Telegram WebApp
          if (!WebApp.initData) {
            setError('Telegram WebApp data not available');
            return;
          }
          
          const payload = {
            initData: WebApp.initData
          };
          
          // Add referral code if present
          if (referralCode) {
            payload.referral_code = referralCode;
          }
          
          const response = await initUser(payload);
          
          if (response.success) {
            setUser(response.user);
          } else {
            setError(response.error || 'Failed to initialize user');
          }
        }
      } catch (err) {
        console.error('Error initializing user:', err);
        setError(err.message || 'Failed to initialize user');
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, [isDevMode, referralCode]);

  // Tell Telegram the app is ready
  useEffect(() => {
    if (!loading && !isDevMode) {
      WebApp.ready();
    }
  }, [loading, isDevMode]);

  // Set up Telegram theme
  useEffect(() => {
    if (!isDevMode) {
      WebApp.setHeaderColor('secondary_bg_color');
      WebApp.setBackgroundColor('bg_color');
    }
  }, [isDevMode]);

  // Function to refresh user data with retry on failure
  const refreshUserData = async (retryCount = 0) => {
    if (!user || !user.telegram_id) return null;
    
    try {
      console.log('Refreshing user data...');
      const userData = await getUserInfo(user.telegram_id);
      
      if (userData.success) {
        console.log('User data refreshed successfully:', userData.user);
        // Update local user state
        setUser(userData.user);
        return userData.user;
      } else {
        console.error('Failed to refresh user data:', userData.error);
        
        // If error and not last retry, try again after 500ms
        if (retryCount < 3) {
          console.log(`Retrying refresh (attempt ${retryCount + 1}/3)...`);
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(refreshUserData(retryCount + 1));
            }, 500);
          });
        }
        
        return null;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      
      // If error and not last retry, try again after 500ms
      if (retryCount < 3) {
        console.log(`Retrying refresh after error (attempt ${retryCount + 1}/3)...`);
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(refreshUserData(retryCount + 1));
          }, 500);
        });
      }
      
      return null;
    }
  };

  return { 
    user, 
    setUser,
    loading, 
    error, 
    isDevMode,
    refreshUserData
  };
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
