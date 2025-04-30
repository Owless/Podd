import React, { useState, useEffect } from 'react';
import { getUserItems, deleteItem } from '../services/api';
import { useApp } from '../contexts/AppContext';
import Layout from '../components/Layout';
import AddItemForm from '../components/AddItemForm';
import ItemCard from '../components/ItemCard';
import ErrorMessage from '../components/ErrorMessage';
import SubscriptionBanner from '../components/SubscriptionBanner';
import useDataPolling from '../hooks/useDataPolling';

const HomePage = () => {
  const { user } = useApp();
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use the data polling hook for items
  const {
    data: items,
    loading: itemsLoading,
    error: itemsError,
    refetch: refetchItems,
    isRefreshing
  } = useDataPolling(
    () => getUserItems(user?.telegram_id),
    60000, // Poll every minute
    [user?.telegram_id, refreshTrigger],
    !!user?.telegram_id // Only enable polling when user is logged in
  );

  // Handle item added event
  const handleItemAdded = (newItem) => {
    refetchItems(); // Refetch the items list to include the new item
  };

  // Handle delete item
  const handleDeleteItem = async (itemId) => {
    try {
      const result = await deleteItem(itemId, user.telegram_id);
      
      if (result.success) {
        // Refresh items list
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Display loading state
  if (itemsLoading && !items) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 border-t-2 border-b-2 border-purple-800 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Загружаем ваши товары...</p>
        </div>
      </Layout>
    );
  }

  // Display error state
  if (itemsError) {
    return (
      <Layout>
        <ErrorMessage 
          message="Не удалось загрузить товары. Пожалуйста, попробуйте позже." 
          onRetry={refetchItems}
        />
      </Layout>
    );
  }

  // Check if items data is properly loaded
  const itemsList = items?.items || [];

  return (
    <Layout>
      {/* App Description */}
      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 mb-6">
        <h1 className="text-lg font-semibold text-purple-900 mb-2">Трекер цен WB</h1>
        <p className="text-gray-600 text-sm">
          Отслеживайте изменения цен на товары Wildberries и получайте уведомления о снижении цен.
        </p>
      </div>

      {/* Subscription Banner */}
      <SubscriptionBanner />

      {/* Add Item Form */}
      <AddItemForm onItemAdded={handleItemAdded} />

      {/* Items List */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Отслеживаемые товары 
            <span className="ml-2 text-sm text-gray-500">({itemsList.length})</span>
          </h2>
          
          {isRefreshing && (
            <span className="text-xs text-gray-500 flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Обновление...
            </span>
          )}
        </div>

        {itemsList.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
            <svg className="w-14 h-14 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-gray-500 mb-2">У вас пока нет отслеживаемых товаров</p>
            <p className="text-sm text-gray-400">Добавьте товар для отслеживания с помощью формы выше</p>
          </div>
        ) : (
          <div className="space-y-3">
            {itemsList.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onDelete={handleDeleteItem}
                expandedItemId={expandedItemId}
                setExpandedItemId={setExpandedItemId}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
