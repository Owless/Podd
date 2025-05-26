import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getReferralInfo } from '../services/api';
import Layout from '../components/Layout';
import ErrorMessage from '../components/ErrorMessage';

const ReferralsPage = () => {
  const { user, loading: userLoading } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referralData, setReferralData] = useState({
    referral_link: '',
    referral_code: '',
    total_referrals: 0,
    active_referrals: 0,
    earned_days: 0
  });
  const [copyNotification, setCopyNotification] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (userLoading) return;
    
    if (!user) {
      navigate('/');
      return;
    }

    const loadReferralData = async () => {
      try {
        setLoading(true);
        const response = await getReferralInfo(user.telegram_id);
        
        if (response.success) {
          setReferralData(response);
          setError(null);
        } else {
          setError(response.error || 'Не удалось загрузить информацию о рефералах');
        }
      } catch (err) {
        setError('Не удалось загрузить информацию о рефералах. Попробуйте позже.');
        console.error('Error fetching referral data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReferralData();
  }, [user, userLoading, navigate]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopyNotification(`${type} скопирована!`);
        setTimeout(() => setCopyNotification(''), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setCopyNotification('Не удалось скопировать ссылку');
      });
  };

  if (userLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800">
          <ErrorMessage message={error} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-6 pb-24">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-3">
                Пригласи друзей и получи бонус
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Делись ссылкой с друзьями и получай дополнительные дни подписки
              </p>
            </div>

            {/* Copy Notification */}
            {copyNotification && (
              <div className="fixed top-4 right-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl shadow-xl z-50 transition-all duration-300 animate-pulse">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">{copyNotification}</span>
                </div>
              </div>
            )}

            {/* Referral Link Card */}
            <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 sm:p-8 text-white relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="bg-white/20 p-3 rounded-xl mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold">Твоя реферальная ссылка</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <input
                      type="text"
                      value={referralData.referral_link}
                      className="w-full bg-transparent text-white placeholder-white/70 outline-none text-sm sm:text-base"
                      readOnly
                    />
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(referralData.referral_link, 'Ссылка')}
                    className="w-full bg-white text-purple-600 py-4 px-6 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>Скопировать ссылку</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500"></div>
              
              <div className="p-6 sm:p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-xl mr-4 shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Твоя статистика рефералов
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 p-6 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                    <div className="text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
                        {referralData.total_referrals}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 font-medium">Всего рефералов</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-6 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50">
                    <div className="text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                        {referralData.earned_days}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 font-medium">Заработано дней</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How it works Card */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              
              <div className="p-6 sm:p-8">
                <div className="flex items-center mb-8">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl mr-4 shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Как это работает
                  </h2>
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-full h-12 w-12 flex items-center justify-center mr-6 shrink-0 shadow-lg">
                      <span className="font-bold text-white text-lg">1</span>
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">Поделись ссылкой</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Отправь уникальную реферальную ссылку друзьям через любой мессенджер
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full h-12 w-12 flex items-center justify-center mr-6 shrink-0 shadow-lg">
                      <span className="font-bold text-white text-lg">2</span>
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">При входе в приложение</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Когда друг регистрируется по твоей ссылке, вы оба получаете 5 дней бесплатной подписки
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full h-12 w-12 flex items-center justify-center mr-6 shrink-0 shadow-lg">
                      <span className="font-bold text-white text-lg">3</span>
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">Дополнительный бонус</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        При оформлении другом подписки на год ты получишь 30 дней бесплатной подписки
                      </p>
                    </div>
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

export default ReferralsPage;
