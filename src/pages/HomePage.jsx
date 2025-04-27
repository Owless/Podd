import React, { useState, useEffect } from 'react';
import { getUserItems, deleteItem, updateItem } from '../services/api';
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
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

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
        if (expandedItemId === itemId) {
          setExpandedItemId(null);
        }
      } else {
        alert(response.error || 'Не удалось удалить товар');
      }
    } catch (err) {
      alert('Произошла ошибка при удалении товара');
      console.error(err);
    }
  };

  // Обработчик редактирования товара - открывает модальное окно
  const handleEditItem = (item) => {
    setEditingItem(item);
  };

  // Обработчик сохранения изменений
  const handleSaveEdit = async (itemId, newDesiredPrice) => {
    try {
      // Предполагается наличие API функции updateItem
      const response = await updateItem(itemId, { desired_price: newDesiredPrice }, user.telegram_id);
      
      if (response.success) {
        setItems((prevItems) => 
          prevItems.map(item => 
            item.id === itemId ? { ...item, desired_price: newDesiredPrice } : item
          )
        );
        setEditingItem(null);
      } else {
        alert(response.error || 'Не удалось обновить цену');
      }
    } catch (err) {
      alert('Произошла ошибка при обновлении цены');
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
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Отслеживание цен Wildberries
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Добавляйте товары и получайте уведомления о снижении цены
        </p>
      </header>
      
      <SubscriptionBanner />
      
      <AddItemForm onItemAdded={handleItemAdded} />
      
      {error ? (
        <ErrorMessage message={error} onRetry={handleRetry} />
      ) : loading ? (
        <div className="py-8 flex justify-center">
          <div className="w-10 h-10 border-2 border-purple-800 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="mt-2 mb-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Ваши товары
            </h2>
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              Всего: {items.length}
            </span>
          </div>
          
          {items.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200 shadow-sm">
              <svg className="w-14 h-14 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <p className="text-gray-600 font-medium">
                У вас пока нет товаров для отслеживания
              </p>
              <p className="text-gray-500 text-sm mt-1">
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
                  onEdit={handleEditItem}
                  expandedItemId={expandedItemId}
                  setExpandedItemId={setExpandedItemId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal for editing desired price */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-3">Изменить желаемую цену</h3>
            <div className="text-sm mb-4 line-clamp-1">{editingItem.title}</div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const newPrice = parseFloat(e.target.price.value);
              if (isNaN(newPrice) || newPrice <= 0) {
                alert('Пожалуйста, введите корректную цену');
                return;
              }
              handleSaveEdit(editingItem.id, newPrice);
            }}>
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-1">Текущая цена: {new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                  minimumFractionDigits: 0
                }).format(editingItem.current_price)}</label>
                <input 
                  type="number" 
                  name="price"
                  defaultValue={editingItem.desired_price}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="1"
                  step="any"
                  required
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HomePage;
