import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { ClipboardIcon, GiftIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const ReferralStats = ({ stats }) => {
  const { user } = useApp();
  const [copyStatus, setCopyStatus] = useState('');

  // Копирование реферальной ссылки
  const copyReferralLink = () => {
    navigator.clipboard.writeText(stats?.referral_link)
      .then(() => {
        setCopyStatus('Ссылка скопирована!');
        setTimeout(() => setCopyStatus(''), 2000);
      })
      .catch(() => {
        setCopyStatus('Ошибка копирования');
        setTimeout(() => setCopyStatus(''), 2000);
      });
  };

  // Форматирование числа с разделителями
  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  return (
    <div className="space-y-6">
      {/* Блок с реферальной ссылкой */}
      <div className="bg-tg-secondary p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardIcon className="w-5 h-5 text-tg-button" />
          <h3 className="font-medium">Ваша реферальная ссылка</h3>
        </div>
        
        <div className="flex gap-2">
          <input
            value={stats?.referral_link || ''}
            readOnly
            className="flex-1 bg-tg-bg text-tg-text p-2 rounded-lg border border-tg-secondary"
          />
          <button
            onClick={copyReferralLink}
            className="tg-button px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <ClipboardIcon className="w-4 h-4" />
            Копировать
          </button>
        </div>
        
        {copyStatus && (
          <div className="mt-2 text-sm text-green-500">{copyStatus}</div>
        )}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-tg-secondary p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <UserGroupIcon className="w-5 h-5 text-tg-button" />
            <span className="text-sm">Приглашено</span>
          </div>
          <div className="text-2xl font-bold">
            {formatNumber(stats?.total_referrals) || 0}
          </div>
        </div>

        <div className="bg-tg-secondary p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <GiftIcon className="w-5 h-5 text-tg-button" />
            <span className="text-sm">Бонусные дни</span>
          </div>
          <div className="text-2xl font-bold text-green-500">
            +{formatNumber(stats?.earned_days) || 0}
          </div>
        </div>
      </div>

      {/* Инструкция */}
      <div className="bg-tg-secondary p-4 rounded-xl">
        <h4 className="font-medium mb-3">Как это работает?</h4>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <div className="w-5 h-5 bg-tg-button text-white rounded-full flex items-center justify-center">1</div>
            <span>Поделитесь вашей реферальной ссылкой</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-5 h-5 bg-tg-button text-white rounded-full flex items-center justify-center">2</div>
            <span>За каждого приглашённого друга получаете +5 дней</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-5 h-5 bg-tg-button text-white rounded-full flex items-center justify-center">3</div>
            <span>Если друг купит подписку - вы получите дополнительные дни</span>
          </li>
        </ul>
      </div>

      {/* Прогресс бар (пример) */}
      <div className="bg-tg-secondary p-4 rounded-xl">
        <div className="flex justify-between mb-2 text-sm">
          <span>До следующего уровня</span>
          <span>3/10 приглашённых</span>
        </div>
        <div className="w-full bg-tg-bg rounded-full h-2">
          <div 
            className="bg-tg-button h-2 rounded-full" 
            style={{ width: `${(3/10)*100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ReferralStats;
