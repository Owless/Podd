import React from 'react';
import { AppContext } from './AppContext';
import { useAppState } from './useAppState';

export const AppProvider = ({ children }) => {
  const appState = useAppState();
  return (
    <AppContext.Provider value={appState}>
      {children}
    </AppContext.Provider>
  );
};
