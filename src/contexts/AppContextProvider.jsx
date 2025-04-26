import React from 'react';
import { AppContext } from './AppContext';

export const AppProvider = ({ children }) => {
  return (
    <AppContext.Provider value={appState}>
      {children}
    </AppContext.Provider>
  );
};
