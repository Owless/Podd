import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { useApp } from '../contexts/AppContext';
import { getSubscriptionPlans, createSubscription } from '../services/api';
import { useNavigate } from 'react-router-dom';

const SubscriptionBanner = () => {
  const { user, isDevMode, refreshUserData } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPlans, setShowPlans] = useState(false);
  const [plans, setPlans] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showStarsHelp, setShowStarsHelp] = useState(false);
  const navigate = useNavigate();

  // Загрузка планов подписки
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const result = await getSubscriptionPlans();
        if (result.success) {
          setPlans(result.plans);
          console.log("Loaded subscription plans:", result.plans);
        }
      } catch (err) {
        console.error('Error loading plans:', err);
      }
    };
    
    loadPlans();
  }, []);

  // Проверка статуса оплаты и обновление данных
  useEffect(() => {
    let checkIntervalId;
    
    const checkPaymentStatus = async () => {
      try {
        const paymentToken = localStorage.getItem('paymentToken');
        
        if (paymentToken) {
          console.log('Checking payment status...');
          
          // Принудительно обновляем данные пользователя с сервера
          const updatedUser = await refreshUserData();
          
          if (updatedUser && updatedUser.subscription_active) {
            console.log('Subscription is now active!');
            
            // Очищаем хранилище
            localStorage.removeItem('paymentToken');
            
            // Закрываем панель выбора плана
            setShowPlans(false);
            
            // Показываем поздравление
            WebApp.showPopup({
              title: "Поздравляем!",
              message: "Подписка успешно активирована!",
              buttons: [{ type: "ok" }]
            });
            
            // Перенаправляем на главную страницу
            navigate('/', { replace: true });
          }
        }
      } catch (err) {
        console.error('Error checking payment:', err);
      }
    };

    // Проверяем статус каждые 3 секунды
    checkIntervalId = setInterval(checkPaymentStatus, 3000);
    
    // Также проверяем при фокусе на приложении
    const handleAppFocus = () => {
      checkPaymentStatus();
    };
    
    window.addEventListener('focus', handleAppFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleAppFocus();
      }
    });
    
    // Запускаем первую проверку
    checkPaymentStatus();
    
    return () => {
      clearInterval(checkIntervalId);
      window.removeEventListener('focus', handleAppFocus);
    };
  }, [refreshUserData, navigate]);

  // Единый обработчик открытия планов
  const handleOpenPlans = () => {
    console.log("handleOpenPlans called");
    setShowPlans(true);
    setSelectedPlan(null);
    console.log("showPlans set to true");
  };

  const handleClosePlans = () => {
    console.log("handleClosePlans called");
    setShowPlans(false);
    setSelectedPlan(null);
  };

  const handleSelectPlan = (planId) => {
    console.log("Selected plan:", planId);
    setSelectedPlan(planId);
  };

  // Единый обработчик подписки (для покупки и продления)
  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setError('Выберите план подписки');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      console.log("Starting subscription process for plan:", selectedPlan);
      
      if (isDevMode) {
        alert('В режиме разработки подписка не доступна');
        setLoading(false);
        return;
      }
      
      // Единый вызов API для создания/продления подписки
      const result = await createSubscription({
        telegram_id: user.telegram_id,
        plan_id: selectedPlan
      });
      
      console.log("Subscription creation result:", result);
      
      if (result.success && result.payment_url) {
        // Store payment token in localStorage
        if (result.payment_token) {
          localStorage.setItem('paymentToken', result.payment_token);
          console.log("Payment token saved:", result.payment_token);
        }
        
        // Open the payment URL
        console.log("Opening payment URL:", result.payment_url);
        WebApp.openTelegramLink(result.payment_url);
      } else {
        setError(result.error || 'Не удалось создать подписку');
        console.error("Subscription creation failed:", result.error);
      }
    } catch (err) {
      setError('Произошла ошибка при создании подписки');
      console.error('Error during subscription:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Экран выбора плана подписки (одинаковый для обоих сценариев)
  const SubscriptionPlansScreen = () => (
    <div className="bg-white rounded-xl p-5 shadow-md border border-blue-200 bg-blue-50 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-blue-800">Выберите план подписки</h3>
        <button 
          onClick={handleClosePlans}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {plans && (
        <div className="space-y-3 mb-4">
          {Object.values(plans).map(plan => (
            <div 
              key={plan.id}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                selectedPlan === plan.id 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => handleSelectPlan(plan.id)}
            >
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-800">{plan.name}</h4>
                    {plan.discount && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        -{plan.discount}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-800">{plan.price} ⭐</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <button 
          onClick={() => setShowStarsHelp(prevState => !prevState)}
          className="w-full flex justify-between items-center font-medium text-amber-800 mb-0"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Как купить звезды
          </div>
          <svg className={`w-5 h-5 transition-transform ${showStarsHelp ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        {showStarsHelp && (
          <ol className="list-decimal list-inside space-y-1 text-sm text-amber-700 ml-1 mt-2 pt-2 border-t border-amber-200">
            <li>Перейдите к боту <a 
              href="https://t.me/PremiumBot" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-purple-700 font-medium"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                WebApp.openTelegramLink("https://t.me/PremiumBot");
              }}
            >@PremiumBot</a></li>
            <li>Отправьте команду <span className="bg-gray-100 px-1 py-0.5 rounded font-mono">/stars</span> для покупки звезд</li>
            <li>Следуйте инструкциям бота для оплаты (поддерживаются российские карты)</li>
            <li>После покупки вернитесь в приложение</li>
          </ol>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          onClick={handleClosePlans}
          className="flex-1 py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl"
          disabled={loading}
        >
          Назад
        </button>
        
        <button
          onClick={handleSubscribe}
          className="flex-1 py-3 px-5 bg-purple-800 hover:bg-purple-900 text-white font-medium rounded-xl"
          disabled={loading || !selectedPlan}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Оформление...
            </>
          ) : (
            // Унифицированный текст кнопки
            'Оформить подписку'
          )}
        </button>
      </div>
    </div>
  );
  
  // Если показываем планы, вернуть экран выбора плана
  if (showPlans) {
    console.log("Rendering plans selection view");
    return <SubscriptionPlansScreen />;
  }
  
  // Если подписка активна
  if (user?.subscription_active) {
    const endDate = new Date(user.subscription_end_date);
    
    // Формат даты и времени
    const formattedDate = endDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const formattedTime = endDate.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysLeft <= 3;
    
    return (
      <div className={`bg-white rounded-xl p-5 shadow-md border mb-6 flex flex-col md:flex-row md:items-center gap-4 ${isExpiringSoon ? 'border-amber-300 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
        <div className="flex-1">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-green-800">
              {isExpiringSoon ? 'Подписка скоро заканчивается' : 'Подписка активна'}
            </h3>
          </div>
          
          <p className="text-sm text-green-700 mt-1">
            Ваша подписка действует до {formattedDate} {formattedTime}
          </p>
          
          {isExpiringSoon && (
            <p className="text-sm text-amber-700 font-medium mt-1">
              Осталось {daysLeft} дн.
            </p>
          )}
          
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleOpenPlans}
          className="py-3 px-5 bg-purple-800 hover:bg-purple-900 text-white font-medium rounded-xl text-sm whitespace-nowrap"
        >
          {loading ? 'Загрузка...' : 'Продлить'}
        </button>
      </div>
    );
  }
  
  // Базовый вид баннера (без подписки и не в режиме выбора плана)
  return (
    <div className="bg-white rounded-xl p-5 shadow-md border border-purple-200 bg-purple-50 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-purple-800">Бесплатный режим</h3>
          </div>
          
          <p className="text-sm text-purple-700 mt-1 mb-3 md:mb-0">
            Вы можете отслеживать только один товар. Оформите подписку для отслеживания большего количества товаров.
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleOpenPlans}
          className="py-3 px-5 bg-purple-800 hover:bg-purple-900 text-white font-medium rounded-xl text-sm whitespace-nowrap flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Оформить подписку
        </button>
      </div>
    </div>
  );
};

export default SubscriptionBanner;
