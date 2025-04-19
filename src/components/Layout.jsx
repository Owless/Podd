import React from 'react';
import { useApp } from '../contexts/AppContext';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';

const Layout = ({ children }) => {
  const { loading, error } = useApp();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        {children}
      </main>
    </div>
  );
};

export default Layout;
