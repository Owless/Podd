import { useState, useEffect, useRef } from 'react';

/**
 * Хук для периодического опроса данных с ограниченной частотой обновления
 * @param {Function} fetchFunction - Функция для получения данных
 * @param {number} pollingInterval - Интервал опроса в миллисекундах (по умолчанию 15000 мс = 15 секунд)
 * @param {Array} dependencies - Зависимости, при изменении которых нужно запустить опрос повторно
 * @param {boolean} enabled - Флаг, включающий или отключающий опрос
 * @returns {Object} - Объект с данными, состоянием загрузки и ошибкой
 */
const useDataPolling = (
  fetchFunction,
  pollingInterval = 60000, // Увеличиваем интервал до 15 секунд
  dependencies = [],
  enabled = true
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Используем useRef для хранения таймера, чтобы избежать проблем с замыканиями
  const timerRef = useRef(null);
  
  // Флаг для отслеживания видимости страницы
  const isVisibleRef = useRef(true);
  
  // Последний раз, когда были обновлены данные
  const lastUpdateTimeRef = useRef(0);
  
  // Минимальный интервал между обновлениями данных (5 секунд)
  const minimumUpdateInterval = 5000;

  // Функция для загрузки данных
  const fetchData = async () => {
    // Проверяем, прошло ли достаточно времени с последнего обновления
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    
    // Если прошло меньше минимального интервала - не обновляем
    if (timeSinceLastUpdate < minimumUpdateInterval) {
      console.log(`Skipping update, last update was ${timeSinceLastUpdate}ms ago`);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction();
      
      // Обновляем данные только если страница видима
      if (isVisibleRef.current) {
        setData(result);
        setLastUpdated(new Date());
        lastUpdateTimeRef.current = Date.now();
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Запуск опроса при монтировании компонента и при изменении зависимостей
  useEffect(() => {
    // Отслеживаем видимость страницы
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
      
      // Если страница стала видимой, сразу обновляем данные
      if (isVisibleRef.current && enabled) {
        fetchData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Первоначальная загрузка данных
    if (enabled) {
      fetchData();
    }
    
    // Настройка интервала для опроса, только если включено
    if (enabled) {
      timerRef.current = setInterval(() => {
        // Проверяем, видима ли страница
        if (isVisibleRef.current) {
          fetchData();
        }
      }, pollingInterval);
    }
    
    // Очистка при размонтировании
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [...dependencies, enabled, pollingInterval]);

  // Обновить данные принудительно
  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch
  };
};

export default useDataPolling;
