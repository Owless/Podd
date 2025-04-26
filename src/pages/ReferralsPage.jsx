import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import ReferralStats from '../components/ReferralStats';
import LoadingSpinner from '../components/LoadingSpinner';

const ReferralsPage = () => {
  const { user, refreshUserData } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch(`/api/user/referrals?telegram_id=${user.telegram_id}`);
        const data = await response.json();
        if (data.success) setStats(data);
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadStats();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="referrals-page">
      <h2>Реферальная система</h2>
      <ReferralStats stats={stats} />
      <button onClick={refreshUserData}>Обновить данные</button>
    </div>
  );
};

export default ReferralsPage;
