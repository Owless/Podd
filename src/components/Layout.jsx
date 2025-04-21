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
          {/* Используем логотип из папки public */}
          <img 
            src="/logo.png" // Путь к файлу в папке public
            alt="PriceBerry Logo" 
            className="w-8 h-8 mr-2" // Сохраняем стили для размера и отступа
          />
          <h1 className="text-lg font-bold">PriceBerry трекер цен</h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        {children}
      </main>
      
      {/* Нижняя часть (footer) была удалена */}
    </div>
  );
};

export default Layout;
