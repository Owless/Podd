import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { useApp } from '../contexts/AppContext';
import { getSubscriptionPlans, createSubscription, checkSubscription } from '../services/api';

const SubscriptionBanner = () => {
  const { user, isDevMode, refreshUserData } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPlans, setShowPlans] = useState(false);
  const [plans, setPlans] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);

  // Загрузка планов подписки
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const result = await getSubscriptionPlans();
        if (result.success) {
          setPlans(result.plans);
        }
      } catch (err) {
        console.error('Error loading plans:', err);
      }
    };
    
    loadPlans();
  }, []);

  // Проверка статуса оплаты при возвращении в приложение
  useEffect(() => {
    const checkPaymentOnResume = async () => {
      try {
        const paymentToken = localStorage.getItem('paymentToken');
        if (paymentToken) {
          console.log('Checking payment status...');
          const result = await checkSubscription({
            telegram_id: user.telegram_id
          });
          
          if (result.success && result.subscription.active) {
            localStorage.removeItem('paymentToken');
            WebApp.showPopup({
              title: "Поздравляем!",
              message: "Подписка успешно активирована!",
              buttons: [{ type: "ok" }]
            });
            refreshUserData();
          }
        }
      } catch (err) {
        console.error('Error checking payment:', err);
      }
    };

    // Событие на возвращение в приложение
    window.addEventListener('focus', checkPaymentOnResume);
    
    // Проверяем сразу при загрузке
    checkPaymentOnResume();
    
    return () => {
      window.removeEventListener('focus', checkPaymentOnResume);
    };
  }, [user.telegram_id, refreshUserData]);

  const handleOpenPlans = () => {
    setShowPlans(true);
  };

  const handleClosePlans = () => {
    setShowPlans(false);
    setSelectedPlan(null);
    setPaymentUrl('');
    setShowPaymentInstructions(false);
  };

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
  };

 const handleSubscribe = async () => {
  if (!selectedPlan) {
    setError('Выберите план подписки');
    return;
  }
  
  try {
    setLoading(true);
    setError('');
    
    if (isDevMode) {
      alert('В режиме разработки подписка не доступна');
      setLoading(false);
      return;
    }
    
    // Create subscription
    const result = await createSubscription({
      telegram_id: user.telegram_id,
      plan_id: selectedPlan
    });
    
    if (result.success && result.payment_url) {
      // Open the payment URL
      WebApp.openTelegramLink(result.payment_url);
      
      // Set a timer to check subscription status after return
      setTimeout(() => {
        checkPaymentStatus();
      }, 2000);
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
  
  // Компонент с инструкциями по оплате
  const PaymentInstructions = () => {
    const copyToClipboard = () => {
      navigator.clipboard.writeText(paymentUrl)
        .then(() => {
          WebApp.showPopup({
            title: "Успех!",
            message: "Ссылка скопирована. Вставьте её в чат и нажмите на неё",
            buttons: [{ type: "ok" }]
          });
        })
        .catch(err => {
          console.error('Ошибка при копировании:', err);
          WebApp.showAlert("Не удалось скопировать ссылку. Пожалуйста, скопируйте её вручную: " + paymentUrl);
        });
    };
    
    const directOpen = () => {
      try {
        // Пробуем открыть напрямую - это может не сработать, поэтому в блоке try-catch
        WebApp.openTelegramLink(paymentUrl);
      } catch (e) {
        console.error('Error opening link directly:', e);
        WebApp.showAlert("Не удалось открыть ссылку напрямую. Пожалуйста, воспользуйтесь методом копирования.");
      }
    };
    
    return (
      <div className="mt-4 p-4 border border-blue-300 rounded-lg bg-blue-50 dark:bg-blue-900/30">
        <h4 className="font-medium mb-2">Инструкция по оплате:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Скопируйте ссылку на оплату</li>
          <li>Вернитесь в Telegram</li>
          <li>Вставьте ссылку в любой чат и нажмите на неё</li>
          <li>Следуйте инструкциям бота для оплаты</li>
          <li>После оплаты вернитесь в это приложение</li>
        </ol>
        
        <div className="mt-4 flex flex-col gap-2">
          <button 
            onClick={copyToClipboard}
            className="btn-primary text-sm"
          >
            Скопировать ссылку на оплату
          </button>
          
          <button 
            onClick={directOpen}
            className="btn-secondary text-sm"
          >
            Открыть напрямую (может не работать)
          </button>
          
          <button 
            onClick={() => setShowPaymentInstructions(false)}
            className="btn-text text-sm"
          >
            Вернуться к выбору плана
          </button>
        </div>
      </div>
    );
  };
  
  // Если подписка активна
  if (user?.subscription_active) {
    const endDate = new Date(user.subscription_end_date);
    const formattedDate = endDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
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
            onClick={handleOpenPlans}
            disabled={loading}
            className="btn-primary text-sm py-2"
          >
            {loading ? 'Загрузка...' : 'Продлить'}
          </button>
        )}
      </div>
    );
  }
  
  // Если показываем планы
  if (showPlans) {
    return (
      <div className="card mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300">Выберите план подписки</h3>
          <button 
            onClick={handleClosePlans}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Показываем инструкции по оплате или список планов */}
        {showPaymentInstructions ? (
          <PaymentInstructions />
        ) : (
          <>
            {plans && (
              <div className="space-y-3 mb-4">
                {Object.values(plans).map(plan => (
                  <div 
                    key={plan.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedPlan === plan.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium">{plan.name}</h4>
                          {plan.discount && (
                            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              -{plan.discount}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{plan.price} ⭐</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={handleClosePlans}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Назад
              </button>
              
              <button
                onClick={handleSubscribe}
                className="btn-primary flex-1"
                disabled={loading || !selectedPlan}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Оформление...
                  </>
                ) : 'Оформить подписку'}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
  
  // Базовый вид баннера (без подписки и не в режиме выбора плана)
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
        </div>
        
        <button
          onClick={handleOpenPlans}
          className="btn-primary text-sm py-2 whitespace-nowrap"
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
