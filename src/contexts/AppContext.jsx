import { createContext, useContext, useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { initUser, getUserInfo } from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const useAppState = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isDevMode = import.meta.env.DEV;

  const refreshUserData = async () => {
    try {
      const data = await getUserInfo();
      if (data.success) setUser(data.user);
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        let response;
        
        if (isDevMode) {
          response = await initUser({
            dev_mode: true,
            telegram_id: 123456,
            username: 'dev_user'
          });
        } else {
          if (!WebApp.initData) throw new Error('Telegram data missing');
          response = await initUser({
            initData: WebApp.initData
          });
        }

        if (response.success) {
          setUser(response.user);
          WebApp.ready();
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    WebApp.setHeaderColor('secondary_bg_color');
    WebApp.setBackgroundColor('bg_color');
    WebApp.expand();

  }, [isDevMode]);

  return {
    user,
    loading,
    error,
    refreshUserData,
    isDevMode
  };
};
