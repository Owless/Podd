import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import ReferralsPage from './pages/ReferralsPage';
import ProfilePage from './pages/ProfilePage';
import BottomNavigation from './components/BottomNavigation';
import { AppProvider } from './contexts/AppContextProvider';

function App() {
  return (
    <AppProvider>
      <Router basename={import.meta.env.BASE_URL || '/'}>
        <div className="app min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Fallback route for 404 errors */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNavigation />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
