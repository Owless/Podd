import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import ReferralsPage from './pages/ReferralsPage';
import ProfilePage from './pages/ProfilePage';
import BottomNavigation from './components/BottomNavigation';
import AppContextProvider  from './contexts/AppContextProvider';

function App() {
  return (
    <AppContextProvider>
      <Router>
        <div className="app min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
          <BottomNavigation />
        </div>
      </Router>
    </AppContextProvider>
  );
}

export default App;
