import React from 'react';
import { AppContext, useAppState } from './AppContext';

export const AppProvider = ({ children }) => {
  const appState = useAppState();
  
return (
  <AppContext.Provider value={{ 
    user, 
    setUser, 
    isLoading,
    isDevMode,
    refreshUserData // Добавьте эту функцию
  }}>
    {children}
  </AppContext.Provider>
);
