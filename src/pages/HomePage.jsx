import React, { useState, useEffect } from 'react';
import { getUserItems, deleteItem } from '../services/api';
import { useApp } from '../contexts/AppContext';
import Layout from '../components/Layout';
import ItemCard from '../components/ItemCard';
import AddItemForm from '../components/AddItemForm';
import SubscriptionBanner from '../components/SubscriptionBanner';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const HomePage = () => {
  const { user } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Загрузка товаров пользователя
  useEffect(() => {
    const fetchItems = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await getUserItems(user.telegram_id);
        
        if (response.success) {
          setItems(response.items || []);
          setError('');
        } else {
          setError(response.error || 'Не удалось загрузить товары');
        }
      } catch (err) {
        setError('Произошла ошибка при загрузке товаров');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [user, refreshKey]);

  // Обработчик добавления товара
  const handleItemAdded = (newItem) => {
    setItems((prevItems) => [...prevItems, newItem]);
  };

  // Обработчик удаления товара
  const handleDeleteItem = async (itemId) => {
    try {
      const response = await deleteItem(itemId, user.telegram_id);
      
      if (response.success) {
        setItems((prevItems) => prevItems.filter(item => item.id !== itemId));
      } else {
        alert(response.error || 'Не удалось удалить товар');
      }
    } catch (err) {
      alert('Произошла ошибка при удалении товара');
      console.error(err);
    }
  };

  // Функция для повторной загрузки в случае ошибки
  const handleRetry = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Layout>
      <header className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-telegram-text">
          Отслеживание цен Wildberries
        </h1>
        <p className="text-sm text-telegram-hint mt-1">
          Добавляйте товары и получайте уведомления о снижении цены
        </p>
      </header>
      
      <SubscriptionBanner />
      
      <AddItemForm onItemAdded={handleItemAdded} />
      
      {error ? (
        <ErrorMessage message={error} onRetry={handleRetry} />
      ) : loading ? (
        <div className="py-8 flex justify-center">
          <div className="w-10 h-10 border-2 border-telegram-button border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="mt-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-telegram-text">
              Ваши товары
            </h2>
            <span className="text-sm text-telegram-hint bg-telegram-secondary px-2 py-1 rounded-full">
              Всего: {items.length}
            </span>
          </div>
          
          {items.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <svg className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <p className="text-telegram-hint font-medium">
                У вас пока нет товаров для отслеживания
              </p>
              <p className="text-telegram-hint text-sm mt-1">
                Добавьте товар с помощью кнопки выше
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <ItemCard 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDeleteItem} 
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default HomePage;
