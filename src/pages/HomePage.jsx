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

  // Загрузка товаров пользователя
  useEffect(() => {
    const fetchItems = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await getUserItems(user.telegram_id);
        
        if (response.success) {
          setItems(response.items || []);
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
  }, [user]);

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

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Отслеживание цен Wildberries</h1>
      
      <SubscriptionBanner />
      
      {error && <ErrorMessage message={error} />}
      
      <AddItemForm onItemAdded={handleItemAdded} />
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Ваши товары</h2>
        
        {items.length === 0 ? (
          <p className="text-telegram-hint">
            У вас пока нет товаров для отслеживания. Добавьте первый товар с помощью формы выше.
          </p>
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
    </Layout>
  );
};

export default HomePage;