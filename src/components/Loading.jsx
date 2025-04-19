import React from 'react';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="relative w-20 h-20">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-telegram-button rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-lg font-medium text-telegram-text">Загрузка данных...</p>
    </div>
  );
};

export default Loading;
