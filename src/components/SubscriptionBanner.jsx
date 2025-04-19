import React, { useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { useApp } from '../contexts/AppContext';
import { createSubscription, checkSubscription } from '../services/api';

const SubscriptionBanner = () => {
  const { user, isDevMode } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (isDevMode) {
        alert('В режиме разработки подписка не доступна');
        setLoading(false);
        return;
      }
      
      // Создаем платеж
      const result = await createSubscription({
        telegram_id: user.telegram_id
      });
      
      if (result.success && result.payment_url) {
        // Сохраняем токен в локальное хранилище для последующей проверки
        localStorage.setItem('paymentToken', result.payment_token);
        
        // Открываем ссылку на оплату
        WebApp.openTelegramLink(result.payment_url);
        
        // После возвращения из Telegram проверяем статус оплаты
        window.addEventListener('focus', checkPaymentStatus);
      } else {
        setError(result.error || 'Не удалось создать подписку');
      }
    } catch (err) {
      setError('Произошла ошибка при создании подписки');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const checkPaymentStatus = async () => {
    try {
      // Удаляем обработчик, чтобы избежать многократных вызовов
      window.removeEventListener('focus', checkPaymentStatus);
      
      // Получаем токен из локального хранилища
      const paymentToken = localStorage.getItem('paymentToken');
      if (!paymentToken) return;
      
      // Проверяем статус платежа
      const result = await checkSubscription({
        payment_token: paymentToken
      });
      
      if (result.success) {
        // Обновляем статус подписки у пользователя
        window.location.reload();
      }
      
      // В любом случае удаляем токен из локального хранилища
      localStorage.removeItem('paymentToken');
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  };
  
  if (user?.subscription_active) {
    // Форматируем дату окончания подписки
    const endDate = new Date(user.subscription_end_date);
    const formattedDate = endDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Проверяем, скоро ли заканчивается подписка (за 3 дня)
    const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysLeft <= 3;
    
    return (
      <div className={`card mb-6 flex flex-col md:flex-row md:items-center gap-4 ${isExpiringSoon ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700' : 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700'}`}>
        <div className="flex-1">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-green-800 dark:text-green-300">
              {isExpiringSoon ? 'Подписка скоро заканчивается' : 'Подписка активна'}
            </h3>
          </div>
          
          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
            {isExpiringSoon 
              ? `Ваша подписка действует до ${formattedDate}. Осталось ${daysLeft} дн.` 
              : `Ваша подписка действует до ${formattedDate}`
            }
          </p>
          
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>
        
        {isExpiringSoon && (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="btn-primary text-sm py-2"
          >
            {loading ? 'Загрузка...' : 'Продлить'}
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="card mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-blue-800 dark:text-blue-300">Бесплатный режим</h3>
          </div>
          
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1 mb-3 md:mb-0">
            Вы можете отслеживать только один товар. Оформите подписку для отслеживания большего количества товаров.
          </p>
          
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>
        
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="btn-primary text-sm py-2 whitespace-nowrap"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Загрузка...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Оформить подписку
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SubscriptionBanner;
