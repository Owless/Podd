import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SubscriptionBanner from '../components/SubscriptionBanner';
import { fetchReferralInfo } from '../services/api';

function ReferralsPage() {
  const { user } = useAppContext();
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
    if (!user) {
      navigate('/');
      return;
    }

    const loadReferralData = async () => {
      try {
        setLoading(true);
        const data = await fetchReferralInfo(user.telegram_id);
        setReferralData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load referral information. Please try again later.');
        console.error('Error fetching referral data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReferralData();
  }, [user, navigate]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Invite Friends & Earn Rewards</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Referral Link</h2>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={referralData.referral_link}
            className="flex-grow p-2 border rounded-md bg-gray-50"
            readOnly
          />
          <button
            onClick={() => copyToClipboard(referralData.referral_link)}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Copy Link
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={referralData.referral_code}
            className="flex-grow p-2 border rounded-md bg-gray-50"
            readOnly
          />
          <button
            onClick={() => copyToClipboard(referralData.referral_code)}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Copy Code
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <span className="font-bold">1</span>
            </div>
            <div>
              <h3 className="font-medium">Share your link</h3>
              <p className="text-gray-600">Send your unique referral link to friends</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <span className="font-bold">2</span>
            </div>
            <div>
              <h3 className="font-medium">Friends subscribe</h3>
              <p className="text-gray-600">When friends sign up using your link and subscribe</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <span className="font-bold">3</span>
            </div>
            <div>
              <h3 className="font-medium">Both get rewarded</h3>
              <p className="text-gray-600">You both receive 5 days of subscription for free! If they purchase an annual plan, you get 30 extra days!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Referral Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <span className="block text-2xl font-bold text-blue-500">{referralData.total_referrals}</span>
            <span className="text-gray-600">Total Referrals</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <span className="block text-2xl font-bold text-blue-500">{referralData.active_referrals}</span>
            <span className="text-gray-600">Pending Bonuses</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <span className="block text-2xl font-bold text-blue-500">{referralData.earned_days}</span>
            <span className="text-gray-600">Days Earned</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <SubscriptionBanner />
      </div>
    </div>
  );
}

export default ReferralsPage;
