import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-telegram-button"></div>
      <p className="ml-4 text-telegram-text">Загрузка...</p>
    </div>
  );
};

export default Loading;