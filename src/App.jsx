import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContextProvider';
import HomePage from './pages/HomePage';
import ReferralsPage from './pages/ReferralsPage';
import ProfilePage from './pages/ProfilePage';
import BottomNavigation from './components/BottomNavigation';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
