import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SubscriptionBanner from '../components/SubscriptionBanner';

export default function ReferralsPage() {
  const { user, setUser } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/user/referrals?telegram_id=${user.telegram_id}`);
        const data = await response.json();
        if (data.success) {
          setStats(data);
          setUser(prev => ({...prev, referralData: data}));
        }
      } catch (err) {
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    
    user?.telegram_id && fetchStats();
  }, [user?.telegram_id]);

  const copyLink = () => {
    navigator.clipboard.writeText(stats?.referral_link);
    alert('Ссылка скопирована!');
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto p-4">
      <SubscriptionBanner />
      
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-4">Ваша реферальная ссылка</h2>
        <div className="flex gap-2 mb-4">
          <input 
            value={stats?.referral_link} 
            readOnly
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            onClick={copyLink}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Копировать
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-3xl font-bold">{stats?.total_referrals}</p>
            <p className="text-gray-600">Всего приглашено</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{stats?.earned_days}</p>
            <p className="text-gray-600">Бонусных дней</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Как это работает?</h3>
        <ul className="list-disc pl-5 space-y-3">
          <li>За каждого приглашённого друга вы получаете +5 дней подписки</li>
          <li>Если друг покупает годовую подписку - вы получаете +30 дней</li>
          <li>Максимальный бонус: 365 дополнительных дней</li>
        </ul>
      </div>
    </div>
  );
}
