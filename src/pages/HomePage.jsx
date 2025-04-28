import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import Layout from '../components/Layout';
import SubscriptionBanner from '../components/SubscriptionBanner';
import AddItemForm from '../components/AddItemForm';
import ItemCard from '../components/ItemCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import useDataPolling from '../hooks/useDataPolling';
import { getUserItems, deleteItem } from '../services/api';

const HomePage = () => {
  const { user, loading: userLoading, error: userError } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Используем хук для опроса данных о товарах
  const {
    data: itemsResponse,
    loading: itemsLoading,
    error: itemsError,
    refetch: refetchItems
  } = useDataPolling(
    () => getUserItems(user?.telegram_id),
    15000, // Опрашиваем каждые 15 секунд
    [user?.telegram_id],
    !!user?.telegram_id // Включаем опрос только если у нас есть telegram_id
  );
  
  // Открытие формы добавления товара
  const handleAddItemClick = () => {
    setShowAddForm(true);
  };
  
  // Закрытие формы добавления товара
  const handleCloseAddForm = () => {
    setShowAddForm(false);
  };
  
  // Добавление товара
  const handleItemAdded = () => {
    setShowAddForm(false);
    // Принудительно обновляем список товаров
    refetchItems();
  };
  
  // Удаление товара
  const handleDeleteItem = async (itemId) => {
    try {
      const result = await deleteItem(itemId, user.telegram_id);
      if (result.success) {
        // Принудительно обновляем список товаров
        refetchItems();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };
  
  // Если данные пользователя загружаются, показываем индикатор загрузки
  if (userLoading) {
    return (
      <Layout title="Загрузка...">
        <div className="flex justify-center items-center h-screen">
          <Loading />
        </div>
      </Layout>
    );
  }
  
  // Если произошла ошибка загрузки пользователя, показываем сообщение об ошибке
  if (userError) {
    return (
      <Layout title="Ошибка">
        <ErrorMessage message={userError} />
      </Layout>
    );
  }
  
  // Если пользователь не загружен, показываем сообщение об ошибке
  if (!user) {
    return (
      <Layout title="Ошибка">
        <ErrorMessage message="Не удалось загрузить данные пользователя" />
      </Layout>
    );
  }
  
  return (
    <Layout title="WB Price Tracker">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Баннер подписки */}
        <SubscriptionBanner />
        
        {/* Товары пользователя */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Мои товары</h2>
            
            {/* Счетчик товаров */}
            <div className="text-sm text-gray-500">
              {itemsResponse?.items?.length || 0}
              {user?.subscription_active ? '' : '/1'}
            </div>
          </div>
          
          {/* Если товары загружаются, показываем индикатор загрузки */}
          {itemsLoading && !itemsResponse && (
            <div className="flex justify-center py-6">
              <Loading />
            </div>
          )}
          
          {/* Если произошла ошибка загрузки товаров, показываем сообщение об ошибке */}
          {itemsError && (
            <ErrorMessage message={itemsError} />
          )}
          
          {/* Список товаров */}
          {itemsResponse?.items && itemsResponse.items.length > 0 ? (
            <div className="space-y-4">
              {itemsResponse.items.map(item => (
                <ItemCard 
                  key={item.id} 
                  item={item} 
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}
            </div>
          ) : (!itemsLoading && (
            <div className="bg-white rounded-xl p-6 shadow-sm text-center border border-gray-200">
              <p className="text-gray-500 mb-4">У вас пока нет товаров для отслеживания</p>
              <button
                onClick={handleAddItemClick}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Добавить товар
              </button>
            </div>
          ))}
          
          {/* Кнопка добавления товара */}
          {(itemsResponse?.items?.length > 0 || itemsLoading) && !showAddForm && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleAddItemClick}
                className={`inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${
                  // Если у пользователя нет подписки и уже есть товар, блокируем кнопку
                  (!user.subscription_active && itemsResponse?.items?.length >= 1) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!user.subscription_active && itemsResponse?.items?.length >= 1}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Добавить товар
              </button>
            </div>
          )}
        </div>
        
        {/* Форма добавления товара */}
        {showAddForm && (
          <AddItemForm 
            telegramId={user.telegram_id} 
            onClose={handleCloseAddForm}
            onItemAdded={handleItemAdded}
          />
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
