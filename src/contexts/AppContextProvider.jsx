// src/contexts/AppContextProvider.jsx
import React from 'react';
import { AppContext } from './AppContext';

export const AppProvider = ({ children }) => {
  const appState = useAppState();
  
  return (
    <AppContext.Provider value={{...appState, refreshUserData}}>
      {children}
    </AppContext.Provider>
  );
};

// Добавляем функцию обновления данных
const refreshUserData = async (setUser) => {
  try {
    const response = await fetch('/api/user/info');
    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
    }
  } catch (error) {
    console.error('Refresh error:', error);
  }
};
