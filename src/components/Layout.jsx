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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-purple-800 text-white py-3 shadow-md">
        <div className="container mx-auto px-4 max-w-3xl flex items-center">
          <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 14l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-lg font-bold">WB Трекер цен</h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        {children}
      </main>
      
      <footer className="bg-white py-3 text-center text-xs text-gray-500 border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-3xl">
          © {new Date().getFullYear()} WB Трекер цен | Отслеживание товаров Wildberries
        </div>
      </footer>
    </div>
  );
};

export default Layout;
