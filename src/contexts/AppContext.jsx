import { createContext, useState, useEffect, useContext } from 'react';
import WebApp from '@twa-dev/sdk';
import { initUser } from '../services/api';

export const AppContext = createContext(null);

export const useAppState = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isDevMode = import.meta.env.DEV;

  // Инициализация пользователя
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        
        // В режиме разработки используем тестовые данные
        if (isDevMode) {
          const response = await initUser({
            dev_mode: true,
            telegram_id: 123456789,
            username: 'test_user',
            first_name: 'Test User'
          });
          
          if (response.success) {
            setUser(response.user);
          } else {
            setError(response.error || 'Failed to initialize user');
          }
        } else {
          // В продакшене используем данные от Telegram WebApp
          if (!WebApp.initData) {
            setError('Telegram WebApp data not available');
            return;
          }
          
          const response = await initUser({
            initData: WebApp.initData
          });
          
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
  }, [isDevMode]);

  // Сообщаем Telegram, что приложение готово
  useEffect(() => {
    if (!loading) {
      WebApp.ready();
    }
  }, [loading]);

  // Настройка темы Telegram
  useEffect(() => {
    if (!isDevMode) {
      WebApp.setHeaderColor('secondary_bg_color');
      WebApp.setBackgroundColor('bg_color');
    }
  }, [isDevMode]);

  return { user, loading, error, isDevMode };
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
const refreshUserData = async () => {
  if (!user || !user.telegram_id) return;
  
  try {
    const userData = await getUserInfo(user.telegram_id);
    if (userData.success) {
      setUser(userData.user);
    }
  } catch (error) {
    console.error('Error refreshing user data:', error);
  }
};

// И добавьте ее в возвращаемый объект контекста
return (
  <AppContext.Provider value={{ 
    user, 
    setUser, 
    isLoading,
    isDevMode,
    refreshUserData // Добавьте эту функцию
  }}>
    {children}
  </AppContext.Provider>
);
