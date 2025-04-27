import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://wb-tracker-api-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Инициализация пользователя
export const initUser = async (userData) => {
  try {
    // Формируем тело запроса
    const payload = {
      ...userData,
      referral_code: userData.referral_code || null,
      start_param: userData.start_param || window.Telegram?.WebApp?.startParam || null
    };

    // Логируем тело запроса ПЕРЕД отправкой
    console.log('Sending payload to /api/user/init:', JSON.stringify(payload, null, 2));

    // Отправляем запрос
    const response = await api.post('/api/user/init', payload);
    return response.data;
  } catch (error) {
    console.error('Error initializing user:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

// Получение списка товаров пользователя
export const getUserItems = async (telegramId) => {
  try {
    const response = await api.get(`/api/items/list?telegram_id=${telegramId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user items:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

// Добавление товара
export const addItem = async (data) => {
  try {
    const response = await api.post('/api/items/add', data);
    return response.data;
  } catch (error) {
    console.error('Error adding item:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

// Удаление товара
export const deleteItem = async (itemId, telegramId) => {
  try {
    const response = await api.delete(`/api/items/delete/${itemId}?telegram_id=${telegramId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting item:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

// Получение информации о товаре по артикулу
export const getProductInfo = async (articleId) => {
  try {
    const response = await api.get(`/api/wb/product-info?article_id=${articleId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product info:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

// Получение информации о пользователе
export const getUserInfo = async (telegramId) => {
  try {
    const response = await api.get(`/api/users/info?telegram_id=${telegramId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

// Получить планы подписки
export const getSubscriptionPlans = async () => {
  try {
    const response = await api.get('/api/subscription/plans');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

// Создать подписку
export const createSubscription = async (data) => {
  try {
    const response = await api.post('/api/subscription/create', data);
    return response.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

// Проверить статус подписки
export const checkSubscription = async (data) => {
  try {
    const response = await api.post('/api/subscription/check', data);
    return response.data;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

// Получение информации о реферальной программе пользователя
export const getReferralInfo = async (telegramId) => {
  try {
    const response = await api.get(`/api/user/referrals?telegram_id=${telegramId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching referral info:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

// Обработка подписки (включая начисление реферальных бонусов)
export const processSubscription = async (data) => {
  try {
    const response = await api.post('/api/subscription/process', data);
    return response.data;
  } catch (error) {
    console.error('Error processing subscription:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

// Создание реферальной ссылки
export const createReferralLink = async (telegramId) => {
  try {
    const response = await api.post('/api/user/create-referral-link', { telegram_id: telegramId });
    return response.data;
  } catch (error) {
    console.error('Error creating referral link:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

// Применение реферального кода
export const applyReferralCode = async (telegramId, referralCode) => {
  try {
    const response = await api.post('/api/user/apply-referral', { 
      telegram_id: telegramId,
      referral_code: referralCode
    });
    return response.data;
  } catch (error) {
    console.error('Error applying referral code:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

// Получение статистики по рефералам
export const getReferralStats = async (telegramId) => {
  try {
    const response = await api.get(`/api/user/referral-stats?telegram_id=${telegramId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching referral statistics:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};
