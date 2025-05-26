
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

  // Load subscription plans
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

  // Check payment status and update data
  useEffect(() => {
    let checkIntervalId;
    
    const checkPaymentStatus = async () => {
      try {
        const paymentToken = localStorage.getItem('paymentToken');
        const previousSubscriptionStatus = localStorage.getItem('previousSubscriptionStatus');
        const subscriptionOperation = localStorage.getItem('subscriptionOperation');
        
        if (paymentToken) {
          console.log('Checking payment status...');
          console.log('Previous subscription status:', previousSubscriptionStatus);
          console.log('Operation type:', subscriptionOperation);
          
          // Force user data refresh from server
          const updatedUser = await refreshUserData();
          
          if (updatedUser) {
            let successMessage = "";
            let paymentSuccessful = false;
            
            // For new subscription - check if status is active
            if (subscriptionOperation === 'purchase' && updatedUser.subscription_active) {
              paymentSuccessful = true;
              successMessage = "Подписка успешно активирована!";
            }
            // For renewal - compare end date with previous one
            else if (subscriptionOperation === 'renewal' && updatedUser.subscription_active) {
              // Check if subscription end date has changed
              const lastEndDate = localStorage.getItem('lastSubscriptionEndDate');
              const currentEndDate = updatedUser.subscription_end_date;
              
              if (lastEndDate && currentEndDate && new Date(currentEndDate) > new Date(lastEndDate)) {
                paymentSuccessful = true;
                successMessage = "Подписка успешно продлена!";
              } else if (!lastEndDate) {
                // If lastEndDate is missing, we can't compare, but assume success
                paymentSuccessful = true;
                successMessage = "Подписка успешно обновлена!";
              }
            }
            
            if (paymentSuccessful) {
              console.log('Subscription operation successful!');
              
              // Clean storage
              localStorage.removeItem('paymentToken');
              localStorage.removeItem('previousSubscriptionStatus');
              localStorage.removeItem('subscriptionOperation');
              localStorage.removeItem('lastSubscriptionEndDate');
              
              // Close plan selection panel
              setShowPlans(false);
              
              // Show congratulations
              WebApp.showPopup({
                title: "Поздравляем!",
                message: successMessage,
                buttons: [{ type: "ok" }]
              });
              
              // Redirect to main page
              navigate('/', { replace: true });
            }
          }
        }
      } catch (err) {
        console.error('Error checking payment:', err);
      }
    };

    // Check status every 3 seconds
    checkIntervalId = setInterval(checkPaymentStatus, 3000);
    
    // Also check when app gets focus
    const handleAppFocus = () => {
      checkPaymentStatus();
    };
    
    window.addEventListener('focus', handleAppFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleAppFocus();
      }
    });
    
    // Run first check
    checkPaymentStatus();
    
    return () => {
      clearInterval(checkIntervalId);
      window.removeEventListener('focus', handleAppFocus);
    };
  }, [refreshUserData, navigate]);

  // Single handler for opening plans
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

  // Subscribe handler with distinction between purchase and renewal
  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setError('Выберите план подписки');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Determine operation type (purchase or renewal)
      const isRenewal = user?.subscription_active;
      console.log(`Starting ${isRenewal ? 'renewal' : 'purchase'} process for plan:`, selectedPlan);
      
      if (isDevMode) {
        alert('В режиме разработки подписка не доступна');
        setLoading(false);
        return;
      }
      
      // Save current subscription status for post-payment check
      localStorage.setItem('previousSubscriptionStatus', isRenewal ? 'true' : 'false');
      localStorage.setItem('subscriptionOperation', isRenewal ? 'renewal' : 'purchase');
      
      // Store current end date for comparison after payment
      if (isRenewal && user.subscription_end_date) {
        localStorage.setItem('lastSubscriptionEndDate', user.subscription_end_date);
      }
      
      // Add operation type to request
      const result = await createSubscription({
        telegram_id: user.telegram_id,
        plan_id: selectedPlan,
        operation_type: isRenewal ? 'renewal' : 'purchase' // Send operation type to backend
      });
      
      console.log(`${isRenewal ? 'Renewal' : 'Subscription'} creation result:`, result);
      
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
        setError(result.error || `Не удалось ${isRenewal ? 'продлить' : 'создать'} подписку`);
        console.error(`${isRenewal ? 'Renewal' : 'Subscription'} creation failed:`, result.error);
      }
    } catch (err) {
      setError(`Произошла ошибка при ${user?.subscription_active ? 'продлении' : 'создании'} подписки`);
      console.error('Error during subscription process:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Subscription plans screen (redesigned)
  const SubscriptionPlansScreen = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-3xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Выберите тариф</h3>
              <p className="text-purple-100 text-sm mt-1">Премиум возможности для вас</p>
            </div>
            <button 
              onClick={handleClosePlans}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Plans container */}
        <div className="p-6">
          {plans && (
            <div className="space-y-4 mb-6">
              {Object.values(plans).map((plan, index) => (
                <div 
                  key={plan.id}
                  className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    selectedPlan === plan.id 
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg' 
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-md bg-white'
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {/* Popular badge */}
                  {index === 0 && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                        ПОПУЛЯРНЫЙ
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="font-bold text-lg text-gray-800">{plan.name}</h4>
                        {plan.discount && (
                          <span className="ml-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            -{plan.discount}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{plan.description}</p>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="flex items-center justify-end">
                        <span className="text-2xl font-bold text-gray-800">{plan.price}</span>
                        <div className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-1">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  {selectedPlan === plan.id && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-purple-500 rounded-full p-1">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Stars help section */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <button 
              onClick={() => setShowStarsHelp(prevState => !prevState)}
              className="w-full flex justify-between items-center font-semibold text-amber-800 group"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                Как купить звезды
              </div>
              <svg className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${showStarsHelp ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            {showStarsHelp && (
              <div className="mt-4 pt-4 border-t border-amber-200">
                <ol className="space-y-3 text-sm text-amber-700">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                    <span>Перейдите к боту <a 
                      href="https://t.me/PremiumBot" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-purple-700 font-semibold hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        WebApp.openTelegramLink("https://t.me/PremiumBot");
                      }}
                    >@PremiumBot</a></span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                    <span>Отправьте команду <code className="bg-gray-200 px-2 py-1 rounded font-mono text-xs">/stars</code> для покупки звезд</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                    <span>Следуйте инструкциям бота для оплаты (поддерживаются российские карты)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                    <span>После покупки вернитесь в приложение</span>
                  </li>
                </ol>
              </div>
            )}
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClosePlans}
              className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
              disabled={loading}
            >
              Назад
            </button>
            
            <button
              onClick={handleSubscribe}
              className="flex-2 py-4 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={loading || !selectedPlan}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Оформление...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {user?.subscription_active ? 'Продлить подписку' : 'Оформить подписку'}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // If showing plans, return plans selection view
  if (showPlans) {
    console.log("Rendering plans selection view");
    return <SubscriptionPlansScreen />;
  }
  
  // If subscription is active
  if (user?.subscription_active) {
    const endDate = new Date(user.subscription_end_date);
    
    // Save current end date for comparison after payment
    useEffect(() => {
      if (user?.subscription_active && user.subscription_end_date) {
        localStorage.setItem('lastSubscriptionEndDate', user.subscription_end_date);
      }
    }, [user?.subscription_active, user?.subscription_end_date]);
    
    // Format date and time
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
      <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg border-2 mb-6 transition-all duration-300 hover:shadow-xl ${
        isExpiringSoon 
          ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50' 
          : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50'
      }`}>
        {/* Background decoration */}
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 ${
          isExpiringSoon ? 'bg-amber-400' : 'bg-emerald-400'
        } transform translate-x-16 -translate-y-16`}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              {isExpiringSoon ? (
                <div className="bg-amber-100 rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              ) : (
                <div className="bg-emerald-100 rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              
              <div>
                <h3 className={`font-bold text-lg ${
                  isExpiringSoon ? 'text-amber-800' : 'text-emerald-800'
                }`}>
                  {isExpiringSoon ? 'Подписка заканчивается' : 'Подписка активна'}
                </h3>
                
                {isExpiringSoon && (
                  <div className="flex items-center mt-1">
                    <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                      Осталось {daysLeft} дн.
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <p className={`text-sm leading-relaxed ${
              isExpiringSoon ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              Ваша подписка действует до <span className="font-semibold">{formattedDate}</span> в <span className="font-semibold">{formattedTime}</span>
            </p>
            
            {error && (
              <p className="text-sm text-red-600 mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>
          
          <button
            type="button"
            onClick={handleOpenPlans}
            className="py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm whitespace-nowrap transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Загрузка...' : 'Продлить'}
          </button>
        </div>
      </div>
    );
  }
  
// Base banner view (no subscription)
  return (
    <div className="relative overflow-hidden rounded-2xl p-6 shadow-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 mb-6 transition-all duration-300 hover:shadow-xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-purple-200 rounded-full opacity-20 transform translate-x-20 -translate-y-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-200 rounded-full opacity-20 transform -translate-x-16 translate-y-16"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <div>
              <h3 className="font-bold text-xl text-purple-800 mb-1">Бесплатный режим</h3>
              <div className="flex items-center">
                <span className="bg-purple-200 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">
                  Базовый план
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <p className="text-purple-700 leading-relaxed">
              Отслеживайте <span className="font-semibold">один товар</span> бесплатно
            </p>
            
            <div className="bg-white bg-opacity-50 rounded-lg p-3 border border-purple-200">
              <h4 className="font-semibold text-purple-800 text-sm mb-2">С подпиской Premium получите:</h4>
              <ul className="space-y-1 text-sm text-purple-700">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Отслеживание неограниченного количества товаров
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Мгновенные уведомления о снижении цен
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Подробная аналитика и история цен
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Приоритетная поддержка
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 md:items-end">
          <button
            type="button"
            onClick={handleOpenPlans}
            className="group py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-3 whitespace-nowrap"
          >
            <div className="bg-white bg-opacity-20 rounded-full p-2 group-hover:bg-opacity-30 transition-all duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">Оформить подписку</div>
              <div className="text-xs text-purple-100">Получить Premium</div>
            </div>
          </button>
          
          <div className="text-center text-xs text-purple-600">
            <span className="bg-white bg-opacity-60 rounded-full px-3 py-1">
              💎 Начните экономить уже сегодня
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBanner;
