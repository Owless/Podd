import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function ReferralsPage() {
  const { user } = useContext(AppContext);
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/user/referrals?telegram_id=${user.telegram_id}`);
        const data = await response.json();
        if (data.success) {
          setReferralData(data);
          // Проверка URL-параметра
          const urlParams = new URLSearchParams(window.location.search);
          const refCode = urlParams.get('ref');
          if (refCode) setCode(refCode);
        }
      } catch (err) {
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchData();
  }, [user]);

  const handleApplyCode = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: user.telegram_id,
          referral_code: code
        })
      });
      const data = await response.json();
      if (data.success) {
        setError('');
        alert('Код успешно применен!');
      } else {
        setError(data.error || 'Ошибка применения кода');
      }
    } catch (err) {
      setError('Ошибка соединения');
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Реферальная система</h1>
      
      <div className="bg-white rounded-lg p-4 shadow-md mb-4">
        <h2 className="text-lg font-semibold mb-2">Ваша ссылка</h2>
        <div className="flex items-center gap-2">
          <input 
            value={referralData?.referral_link} 
            readOnly
            className="flex-1 p-2 border rounded"
          />
          <button 
            onClick={() => navigator.clipboard.writeText(referralData.referral_link)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Копировать
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-md mb-4">
        <h2 className="text-lg font-semibold mb-2">Статистика</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{referralData?.total_referrals}</p>
            <p className="text-gray-600">Приглашено</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{referralData?.earned_days}</p>
            <p className="text-gray-600">Бонусных дней</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleApplyCode} className="bg-white rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold mb-2">Активировать код</h2>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Введите реферальный код"
          className="w-full p-2 border rounded mb-2"
        />
        <button 
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded"
        >
          Применить код
        </button>
      </form>
    </div>
  );
}
