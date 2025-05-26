import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getUserItems, getReferralInfo } from '../services/api';
import Layout from '../components/Layout';

const ProfilePage = () => {
  const { user, refreshUserData, isDevMode } = useApp();
  const [loading, setLoading] = useState(true);
  const [itemsCount, setItemsCount] = useState(0);
  const [referralInfo, setReferralInfo] = useState(null);
  const navigate = useNavigate();

  // Fetch user items count and referral info
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

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

  // Navigate to referrals page
  const goToReferrals = () => {
    navigate('/referrals');
  };

  // Navigate to subscription page
  const goToSubscription = () => {
    navigate('/subscription');
  };

  // Get subscription status display
  const getSubscriptionStatus = () => {
    if (!user) return { status: 'loading', text: 'Загрузка...' };
    
    if (user.subscription_status === 'active' || user.subscription_active) {
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
      <Layout>
        <div className="flex flex-col items-center justify-center p-4 h-screen bg-purple-50 dark:bg-gray-900">
          <div className="animate-pulse w-full max-w-md">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 border-t-4 border-purple-600">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-6"></div>
              <div className="h-10 bg-purple-200 dark:bg-purple-900 rounded w-full"></div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-t-4 border-purple-500">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col p-4 pb-20 bg-purple-50 dark:bg-gray-900 min-h-screen">
        {/* User Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 border-t-4 border-purple-600">
          <div className="flex items-center mb-4">
            <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mr-4">
              {user?.first_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.first_name || 'Пользователь'}</h2>
              {user?.username && <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>}
            </div>
          </div>
          
          {/* Subscription Status */}
          <div 
            className="flex flex-col mb-4 bg-purple-50 dark:bg-gray-700 p-4 rounded-lg cursor-pointer"
            onClick={goToSubscription}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-800 dark:text-gray-300 font-medium">Подписка:</span>
                </div>
                <span className={`font-medium ml-7 ${subStatus.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {subStatus.text}
                </span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Items count */}
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-gray-800 dark:text-gray-300 font-medium">Отслеживаемые товары:</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{itemsCount}</span>
          </div>
          
          {/* Referral Program Teaser */}
          {referralInfo && (
            <div 
              className="bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 p-4 rounded-lg mt-4 cursor-pointer border border-purple-200 dark:border-purple-700 shadow-sm"
              onClick={goToReferrals}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-purple-800 dark:text-purple-300">Реферальная программа</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    Пригласите друзей и получите до 30 дней бесплатной подписки
                  </p>
                </div>
                <div className="text-purple-800 dark:text-purple-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* App Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-t-4 border-purple-500">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">О приложении</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Трекер цен Wildberries позволяет отслеживать изменения цен на товары и получать уведомления 
            о снижении цены или достижении желаемой стоимости.
          </p>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Версия: 1.0.0</span>
              <a href="#" className="text-purple-600 dark:text-purple-400">Условия использования</a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
