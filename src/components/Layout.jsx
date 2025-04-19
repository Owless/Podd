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
    <div className="container mx-auto px-4 py-4 flex-1">
      {children}
    </div>
  );
};

export default Layout;