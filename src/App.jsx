import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import ReferralsPage from './pages/ReferralsPage';
import ProfilePage from './pages/ProfilePage';
import BottomNavigation from './components/BottomNavigation';
import { AppProvider } from './contexts/AppContextProvider'; // с фигурными скобками!
import ErrorModal from './components/ErrorModal';

function App() {
  return (
    <AppProvider> {/* используешь AppProvider */}
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
    </AppProvider>
  );
}

export default App;
