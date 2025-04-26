import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const ReferralsPage = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setLoading(true);
        // Замените на реальный API-вызов
        const response = await fetch('/api/referrals');
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные');
        }
        
        const data = await response.json();
        setReferrals(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferrals();
  }, []);

  // Сгенерировать реферальную ссылку
  const generateReferralLink = () => {
    const baseUrl = window.location.origin;
    const userId = "YOUR_USER_ID"; // Замените на актуальный ID пользователя
    return `${baseUrl}/join?ref=${userId}`;
  };
  
  const referralLink = generateReferralLink();

  if (loading) return <Layout><Loading /></Layout>;
  if (error) return <Layout><ErrorMessage message={error} /></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mb-20">
        <h1 className="text-2xl font-bold mb-6">Партнерская программа</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Ваша реферальная ссылка</h2>
          <div className="flex items-center mb-4">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 border rounded-l px-3 py-2 text-sm"
            />
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-r text-sm"
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                alert('Ссылка скопирована!');
              }}
            >
              Копировать
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Поделитесь этой ссылкой с друзьями и получайте бонусы за каждого приглашенного пользователя.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Ваша статистика</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Всего приглашено</p>
              <p className="text-3xl font-bold text-blue-600">{referrals.length || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Заработано бонусов</p>
              <p className="text-3xl font-bold text-green-600">₽{(referrals.reduce((acc, ref) => acc + (ref.bonus || 0), 0)).toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        {referrals.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Приглашенные пользователи</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата регистрации</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Бонус</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referrals.map((referral) => (
                    <tr key={referral.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{referral.username || 'Пользователь'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(referral.joinedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          referral.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {referral.status === 'active' ? 'Активен' : 'Ожидание'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">₽{referral.bonus?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">У вас пока нет приглашенных пользователей.</p>
            <p className="mt-2 text-sm text-gray-500">Поделитесь своей реферальной ссылкой, чтобы начать зарабатывать бонусы.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReferralsPage;
