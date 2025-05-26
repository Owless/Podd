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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-6 pb-24">
            <div className="max-w-4xl mx-auto">
              {/* Loading skeleton */}
              <div className="space-y-6">
                {/* Profile card skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
                    <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
                    <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
                  </div>
                </div>
                
                {/* Info card skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-6 pb-24">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* User Profile Card - Inline Version */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden transform hover:shadow-2xl transition-all duration-300">
              {/* Gradient header */}
              <div className="h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500"></div>
              
              <div className="p-6 sm:p-8">
                {/* User info - Single row */}
                <div className="flex items-center space-x-6 mb-8">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg">
                      {user?.first_name?.charAt(0) || 'U'}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
                      {user?.first_name || 'Пользователь'}
                    </h1>
                    {user?.username && (
                      <p className="text-gray-600 dark:text-gray-400 font-medium">@{user.username}</p>
                    )}
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  
                  {/* Subscription Status */}
                  <div 
                    className="group bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/50 dark:to-blue-900/50 p-4 sm:p-6 rounded-xl cursor-pointer border border-purple-200/50 dark:border-purple-700/50 hover:shadow-md transition-all duration-200"
                    onClick={goToSubscription}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-lg mr-3 shadow-sm">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">Подписка</span>
                        </div>
                        <div className={`font-bold text-lg ${subStatus.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {subStatus.text}
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Items count */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 p-4 sm:p-6 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-lg mr-3 shadow-sm">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">Товары</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{itemsCount}</div>
                    </div>
                  </div>
                  
                </div>
                
                {/* Referral Program */}
                {referralInfo && (
                  <div 
                    className="group bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 dark:from-purple-900/60 dark:via-blue-900/60 dark:to-indigo-900/60 p-4 sm:p-6 rounded-xl cursor-pointer border border-purple-200/50 dark:border-purple-700/50 shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={goToReferrals}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-sm">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-purple-800 dark:text-purple-300">Реферальная программа</h3>
                          <p className="text-sm text-purple-700 dark:text-purple-400">
                            Приглашайте друзей и получайте до 30 дней бесплатно
                          </p>
                        </div>
                      </div>
                      <div className="text-purple-800 dark:text-purple-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* App Info Card */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              
              <div className="p-6 sm:p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl mr-4 shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    О приложении
                  </h2>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-sm sm:text-base">
                  Трекер цен Wildberries позволяет отслеживать изменения цен на товары и получать уведомления 
                  о снижении цены или достижении желаемой стоимости.
                </p>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Версия 1.0.0
                      </span>
                    </div>
                    <a 
                      href="#" 
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium transition-colors duration-200 hover:underline"
                    >
                      Условия использования
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
