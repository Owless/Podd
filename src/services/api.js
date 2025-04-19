import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://back-8vq3.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Инициализация пользователя
export const initUser = async (userData) => {
  try {
    const response = await api.post('/api/user/init', userData);
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
// Get subscription plans
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

// Create subscription
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

// Check subscription status
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
