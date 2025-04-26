import { Routes, Route } from 'react-router-dom';
import { useApp } from './contexts/AppContext';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ReferralsPage from './pages/ReferralsPage';
import BottomNavigation from './components/BottomNavigation';
import ErrorModal from './components/ErrorModal';
import ReferralStats from './components/ReferralStats';

const App = () => {
  const { loading, error } = useApp();

  if (loading) return <LoadingOverlay />;
  if (error) return <ErrorModal message={error} />;

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/referrals" element={<ReferralsPage />} />
      </Routes>
      <BottomNavigation />
    </div>
  );
};

export default App;
