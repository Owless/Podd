import { useEffect, useState } from 'react';

export const useDataPolling = (fetchFunction, interval = 5000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchFunction();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    // Выполняем первоначальную загрузку
    fetchData();
    
    // Настраиваем интервал для периодического обновления
    const intervalId = setInterval(fetchData, interval);
    
    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(intervalId);
  }, [fetchFunction, interval]);

  return { data, loading, error };
};
