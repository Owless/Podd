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
        setCopyNotification(`${type} скопирован!`);
        setTimeout(() => setCopyNotification(''), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setCopyNotification('Не удалось скопировать текст');
      });
  };

  if (userLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-10 h-10 border-2 border-purple-800 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  return (
    <Layout>
      <header className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Пригласи друзей и получи бонус
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Делись ссылкой с друзьями и получай дополнительные дни подписки
        </p>
      </header>

      {copyNotification && (
        <div className="fixed top-4 right-4 bg-purple-800 text-white px-4 py-2 rounded-md shadow-lg z-50 transition-opacity duration-300">
          {copyNotification}
        </div>
      )}

      <div className="bg-purple-800 rounded-xl shadow-md p-6 mb-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Твоя реферальная ссылка</h2>
        <div className="flex flex-col gap-4 mb-4">
          <div className="relative">
            <input
              type="text"
              value={referralData.referral_link}
              className="w-full p-3 border border-purple-700 rounded-lg bg-purple-700 text-white placeholder-purple-300"
              readOnly
            />
            <button
              onClick={() => copyToClipboard(referralData.referral_link, 'Ссылка')}
            </button>
          </div>
          
          <button
            onClick={() => copyToClipboard(referralData.referral_link, 'Ссылка')}
            className="w-full bg-white text-purple-800 py-3 px-4 rounded-lg text-center font-bold hover:bg-gray-100 transition-colors"
          >
            Скопировать ссылку
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Твоя статистика рефералов</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-100 p-4 rounded-xl text-center">
            <span className="block text-2xl font-bold text-purple-800">{referralData.total_referrals}</span>
            <span className="text-purple-800">Всего рефералов</span>
          </div>
          <div className="bg-purple-100 p-4 rounded-xl text-center">
            <span className="block text-2xl font-bold text-purple-800">{referralData.earned_days}</span>
            <span className="text-purple-800">Заработано дней</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Как это работает</h2>
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="bg-purple-100 rounded-full h-10 w-10 flex items-center justify-center mr-4 shrink-0">
              <span className="font-bold text-purple-800">1</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Поделись ссылкой</h3>
              <p className="text-gray-600 mt-1">Отправь уникальную реферальную ссылку друзьям через любой мессенджер</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-purple-100 rounded-full h-10 w-10 flex items-center justify-center mr-4 shrink-0">
              <span className="font-bold text-purple-800">2</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">При входе в приложение</h3>
              <p className="text-gray-600 mt-1">Когда друг регистрируется по твоей ссылке, вы оба получаете 5 дней бесплатной подписки</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-purple-100 rounded-full h-10 w-10 flex items-center justify-center mr-4 shrink-0">
              <span className="font-bold text-purple-800">3</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Дополнительный бонус</h3>
              <p className="text-gray-600 mt-1">При оформлении другом подписки на год ты получишь 30 дней бесплатной подписки</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReferralsPage;
