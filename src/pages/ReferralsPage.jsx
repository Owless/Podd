import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getReferralInfo } from '../services/api';
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
          setError(response.error || 'Failed to load referral information');
        }
      } catch (err) {
        setError('Failed to load referral information. Please try again later.');
        console.error('Error fetching referral data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReferralData();
  }, [user, userLoading, navigate]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Скопировано в буфер обмена!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        alert('Не удалось скопировать текст');
      });
  };

  if (userLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Пригласи друзей и получи бонус</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Твоя реферальная ссылка</h2>
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            value={referralData.referral_link}
            className="w-full p-2 border rounded-md bg-gray-50"
            readOnly
          />
          <button
            onClick={() => copyToClipboard(referralData.referral_link)}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Скопировать ссылку
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="font-medium">Или используйте код:</div>
          <input
            type="text"
            value={referralData.referral_code}
            className="w-full p-2 border rounded-md bg-gray-50"
            readOnly
          />
          <button
            onClick={() => copyToClipboard(referralData.referral_code)}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Скопировать код
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Как это работает</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center mr-3">
              <span className="font-bold">1</span>
            </div>
            <div>
              <h3 className="font-medium">Поделись своей ссылкой</h3>
              <p className="text-gray-600">Отправь уникальную реферальную ссылку друзьям</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center mr-3">
              <span className="font-bold">2</span>
            </div>
            <div>
              <h3 className="font-medium">Друзья подписываются</h3>
              <p className="text-gray-600">Когда друзья регистрируются по твоей ссылке и оформляют подписку</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center mr-3">
              <span className="font-bold">3</span>
            </div>
            <div>
              <h3 className="font-medium">Вы оба получаете награду</h3>
              <p className="text-gray-600">Вы оба получаете 5 дней подписки бесплатно! Если они приобретают годовой план, ты получаешь дополнительные 30 дней!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Твоя статистика рефералов</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <span className="block text-2xl font-bold text-blue-500">{referralData.total_referrals}</span>
            <span className="text-gray-600">Всего рефералов</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <span className="block text-2xl font-bold text-blue-500">{referralData.active_referrals}</span>
            <span className="text-gray-600">Ожидается бонусов</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <span className="block text-2xl font-bold text-blue-500">{referralData.earned_days}</span>
            <span className="text-gray-600">Заработано дней</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralsPage;
