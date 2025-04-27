import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getSubscriptionPlans, createSubscription, getUserItems, getReferralInfo } from '../services/api';
import WebApp from '@twa-dev/sdk';

const ProfilePage = () => {
  const { user, refreshUserData, isDevMode } = useApp();
  const [subscriptionPlans, setSubscriptionPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [itemsCount, setItemsCount] = useState(0);
  const [referralInfo, setReferralInfo] = useState(null);
  const navigate = useNavigate();

  // Fetch subscription plans and user items count
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get subscription plans
        const plansResponse = await getSubscriptionPlans();
        if (plansResponse.success) {
          setSubscriptionPlans(plansResponse.plans);
        }

        // Get user items count
        if (user?.telegram_id) {
          const itemsResponse = await getUserItems(user.telegram_id);
          if (itemsResponse.success) {
            setItemsCount(itemsResponse.items.length);
          }
          
          // Get referral info
          const referralResponse = await getReferralInfo(user.telegram_id);
          if (referralResponse.success) {
            setReferralInfo(referralResponse);
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.telegram_id]);

  // Format date to human-readable
  const formatDate = (dateString) => {
    if (!dateString) return 'Не активна';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Handle subscription purchase
  const handleSubscription = async (planId) => {
    try {
      if (!user?.telegram_id) return;
      
      const response = await createSubscription({
        telegram_id: user.telegram_id,
        plan_id: planId
      });

      if (response.success && response.payment_url) {
        if (isDevMode) {
          // In dev mode, just log the URL
          console.log('Payment URL:', response.payment_url);
          // Simulate successful payment and refresh user data
          setTimeout(() => {
            refreshUserData();
          }, 2000);
        } else {
          // In production, open the Telegram payment interface
          WebApp.openLink(response.payment_url);
        }
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  // Navigate to referrals page
  const goToReferrals = () => {
    navigate('/referrals');
  };

  // Get subscription status display
  const getSubscriptionStatus = () => {
    if (!user) return { status: 'loading', text: 'Загрузка...' };
    
    if (user.subscription_status === 'active') {
      return { 
        status: 'active', 
        text: `Активна до ${formatDate(user.subscription_end_date)}`
      };
    } else {
      return { status: 'inactive', text: 'Не активна' };
    }
  };

  const subStatus = getSubscriptionStatus();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 h-screen bg-gray-50">
        <div className="animate-pulse w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
            <div className="h-10 bg-purple-200 rounded w-full"></div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-20 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 pb-20 bg-gray-50 min-h-screen">
      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex items-center mb-4">
          <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mr-4">
            {user?.first_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.first_name || 'Пользователь'}</h2>
            {user?.username && <p className="text-gray-600">@{user.username}</p>}
          </div>
        </div>
        
        {/* Subscription Status */}
        <div className="flex flex-col mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Подписка:</span>
            <span className={`font-medium ${subStatus.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
              {subStatus.text}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Отслеживаемые товары:</span>
            <span className="font-medium">{itemsCount}</span>
          </div>
        </div>
        
        {/* Referral Program Teaser */}
        {referralInfo && (
          <div 
            className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-lg mb-4 cursor-pointer"
            onClick={goToReferrals}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-purple-800">Реферальная программа</h3>
                <p className="text-sm text-purple-700">
                  Пригласите друзей и получите до {referralInfo.total_referrals} дней бесплатной подписки
                </p>
              </div>
              <div className="text-purple-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Subscription Plans */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <h3 className="text-xl font-bold mb-4">Тарифы подписки</h3>
        
        {Object.entries(subscriptionPlans)
          .sort((a, b) => a[1].days - b[1].days) // Sort by duration
          .map(([planId, plan]) => (
            <div key={planId} className="border rounded-lg p-4 mb-3 last:mb-0">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-lg">{plan.name}</h4>
                {plan.discount > 0 && (
                  <span className="bg-red-500 text-white px-2 py-1 text-xs rounded-full">
                    -{plan.discount}%
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
              
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-xl">{plan.price} ₽</span>
                  {plan.discount > 0 && (
                    <span className="text-gray-500 text-sm line-through ml-2">
                      {Math.round(plan.price / (1 - plan.discount / 100))} ₽
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={() => handleSubscription(planId)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Оформить
                </button>
              </div>
            </div>
          ))}
      </div>
      
      {/* App Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">О приложении</h3>
        <p className="text-gray-600 mb-4">
          Трекер цен Wildberries позволяет отслеживать изменения цен на товары и получать уведомления 
          о снижении цены или достижении желаемой стоимости.
        </p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Версия: 1.0.0</span>
          <a href="#" className="text-purple-600">Условия использования</a>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
