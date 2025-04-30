import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Хук для периодического опроса данных с ограниченной частотой обновления
 * и проверкой на реальные изменения данных
 * 
 * @param {Function} fetchFunction - Функция для получения данных
 * @param {number} pollingInterval - Интервал опроса в миллисекундах (по умолчанию 60000 мс = 60 секунд)
 * @param {Array} dependencies - Зависимости, при изменении которых нужно запустить опрос повторно
 * @param {boolean} enabled - Флаг, включающий или отключающий опрос
 * @returns {Object} - Объект с данными, состоянием загрузки и ошибкой
 */
const useDataPolling = (
  fetchFunction,
  pollingInterval = 60000,
  dependencies = [],
  enabled = true
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Используем useRef для хранения таймера и предыдущих данных
  const timerRef = useRef(null);
  const previousDataRef = useRef(null);
  
  // Флаг для отслеживания видимости страницы
  const isVisibleRef = useRef(true);
  const isMountedRef = useRef(true);
  
  // Последний раз, когда были обновлены данные
  const lastUpdateTimeRef = useRef(0);
  const fetchInProgressRef = useRef(false);
  
  // Минимальный интервал между обновлениями данных (5 секунд)
  const minimumUpdateInterval = 5000;

  // Функция для сравнения объектов (игнорируя last_checked)
  const isDataChanged = useCallback((oldData, newData) => {
    if (!oldData || !newData) return true;
    
    // Для массивов
    if (Array.isArray(oldData) && Array.isArray(newData)) {
      if (oldData.length !== newData.length) return true;
      
      // Проверяем каждый элемент на значимые изменения
      return newData.some((newItem, index) => {
        const oldItem = oldData[index];
        
        // Если это элементы с id (товары)
        if (newItem && oldItem && 'id' in newItem && 'id' in oldItem) {
          // Если id не совпадают, значит данные изменились
          if (newItem.id !== oldItem.id) return true;
          
          // Проверяем только важные поля, игнорируя last_checked
          return (
            newItem.current_price !== oldItem.current_price ||
            newItem.desired_price !== oldItem.desired_price ||
            newItem.notification_sent !== oldItem.notification_sent ||
            newItem.title !== oldItem.title
          );
        }
        
        // Для других элементов используем простое сравнение
        return JSON.stringify(oldItem) !== JSON.stringify(newItem);
      });
    }
    
    // Для объектов (не массивов)
    if (typeof oldData === 'object' && typeof newData === 'object') {
      // Игнорируем поле last_checked при сравнении
      const oldDataCopy = { ...oldData };
      const newDataCopy = { ...newData };
      
      if ('last_checked' in oldDataCopy) delete oldDataCopy.last_checked;
      if ('last_checked' in newDataCopy) delete newDataCopy.last_checked;
      
      return JSON.stringify(oldDataCopy) !== JSON.stringify(newDataCopy);
    }
    
    // Для примитивов
    return oldData !== newData;
  }, []);

  // Функция для загрузки данных
  const fetchData = useCallback(async (force = false) => {
    // Если загрузка уже идет, не начинаем новую
    if (fetchInProgressRef.current) {
      console.log('Fetch already in progress, skipping');
      return;
    }
    
    // Проверяем, прошло ли достаточно времени с последнего обновления
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    
    // Если прошло меньше минимального интервала и это не принудительное обновление - не обновляем
    if (!force && timeSinceLastUpdate < minimumUpdateInterval) {
      console.log(`Skipping update, last update was ${timeSinceLastUpdate}ms ago`);
      return;
    }
    
    fetchInProgressRef.current = true;
    
    try {
      // Для первой загрузки показываем полный индикатор загрузки
      if (data === null) {
        setLoading(true);
      } else {
        // Для последующих загрузок показываем индикатор обновления
        setIsRefreshing(true);
      }
      
      setError(null);
      
      const result = await fetchFunction();
      
      // Если компонент размонтирован, не обновляем состояние
      if (!isMountedRef.current) return;
      
      // Обновляем данные только если страница видима и данные изменились
      if (isVisibleRef.current) {
        // Проверяем, реально ли изменились данные
        if (isDataChanged(previousDataRef.current, result)) {
          console.log('Data changed, updating state');
          setData(result);
          previousDataRef.current = result;
          setLastUpdated(new Date());
        } else {
          console.log('Data did not change, skipping update');
        }
        
        // Обновляем время последнего запроса в любом случае
        lastUpdateTimeRef.current = Date.now();
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Error fetching data');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
      fetchInProgressRef.current = false;
    }
  }, [fetchFunction, data, isDataChanged]);

  // Запуск опроса при монтировании компонента и при изменении зависимостей
  useEffect(() => {
    isMountedRef.current = true;
    
    // Отслеживаем видимость страницы
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
      
      // Если страница стала видимой, сразу обновляем данные
      if (isVisibleRef.current && enabled) {
        fetchData(true); // Принудительное обновление при возвращении к странице
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
      isMountedRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [...dependencies, enabled, pollingInterval, fetchData]);

  // Обновить данные принудительно
  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch,
    isRefreshing
  };
};

export default useDataPolling;
