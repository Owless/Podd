import React from 'react';
// 1. Импортируем RingLoader из библиотеки
import RingLoader from "react-spinners/RingLoader"; 

const LoadingWithRingLoader = () => {
  // 2. Задаем цвет (можете выбрать любой)
  // Используем фиолетовый из вашего оригинального примера: border-t-purple-800 (#4f46e5)
  // Или цвет из примера по ссылке: #36d7b7 
  const loaderColor = "#4f46e5"; 

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      {/* 3. Используем компонент RingLoader */}
      <RingLoader
        color={loaderColor} // Передаем цвет
        loading={true}     // Управляет отображением лоадера
        size={80}          // Задаем размер (в пикселях) - можете настроить
        aria-label="Loading Spinner"
        data-testid="loader"
        // speedMultiplier={1} // Можно настроить скорость анимации (по умолчанию 1)
      />
      {/* 4. Текст под лоадером */}
      <p className="mt-6 text-lg font-medium text-gray-800">Загрузка данных...</p> 
    </div>
  );
};

// 5. Экспортируем компонент
export default LoadingWithRingLoader;
