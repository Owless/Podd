import React from 'react';
// Импортируем SyncLoader
import SyncLoader from "react-spinners/SyncLoader"; 

const LoadingPriceTracker = () => {
  const loaderColor = "#4f46e5"; // Фиолетовый цвет

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <SyncLoader
        color={loaderColor}
        loading={true}
        size={15} // Размер точек
        margin={5} // Расстояние между точками
        aria-label="Loading Spinner"
        data-testid="loader"
      />
      <p className="mt-6 text-lg font-medium text-gray-800">Обновление цен...</p> 
    </div>
  );
};

export default LoadingPriceTracker;
