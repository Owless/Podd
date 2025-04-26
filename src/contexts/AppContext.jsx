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

  // Извлечение реферального кода из URL, если он есть
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      setReferralCode(refCode);
      
      // Опционально: удаляем параметр ref из URL для чистоты
      const newUrl = window.location.pathname + 
        (urlParams.toString() ? 
          '?' + urlParams.toString().replace(/ref=[^&]*&?/, '') : 
          '');
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Инициализация пользователя
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        
        // В режиме разработки используем тестовые данные
        if (isDevMode) {
          const payload = {
            dev_mode: true,
            telegram_id: 123456789,
            username: 'test_user',
            first_name: 'Test User'
          };
          
          // Добавляем реферальный код, если он есть
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
          // В продакшене используем данные от Telegram WebApp
          if (!WebApp.initData) {
            setError('Telegram WebApp data not available');
            return;
          }
          
          const payload = {
            initData: WebApp.initData
          };
          
          // Добавляем реферальный код, если он есть
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

  // Сообщаем Telegram, что приложение готово
  useEffect(() => {
    if (!loading && !isDevMode) {
      WebApp.ready();
    }
  }, [loading, isDevMode]);

  // Настройка темы Telegram
  useEffect(() => {
    if (!isDevMode) {
      WebApp.setHeaderColor('secondary_bg_color');
      WebApp.setBackgroundColor('bg_color');
    }
  }, [isDevMode]);

  // Функция обновления данных пользователя
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
