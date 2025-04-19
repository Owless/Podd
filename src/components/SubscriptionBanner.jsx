import React from 'react';
import WebApp from '@twa-dev/sdk';
import { useApp } from '../contexts/AppContext';

const SubscriptionBanner = () => {
  const { user, isDevMode } = useApp();
  
  const handleSubscribe = () => {
    if (isDevMode) {
      alert('В режиме разработки подписка не доступна');
      return;
    }
    
    // Здесь будет логика для открытия окна оплаты Telegram Stars
    WebApp.openTelegramLink('https://t.me/$telegram');
  };
  
  if (user?.subscription_active) {
    return (
      <div className="bg-green-100 p-4 rounded-lg mb-4">
        <h3 className="font-semibold text-green-800">Подписка активна</h3>
        <p className="text-sm text-green-700">
          Ваша подписка действует до {new Date(user.subscription_end_date).toLocaleDateString()}
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <h3 className="font-semibold text-blue-800">Бесплатный режим</h3>
      <p className="text-sm text-blue-700 mb-3">
        Вы можете отслеживать только один товар. Для отслеживания большего количества товаров необходима подписка.
      </p>
      <button
        onClick={handleSubscribe}
        className="btn-primary text-sm"
      >
        Оформить подписку
      </button>
    </div>
  );
};

export default SubscriptionBanner;