import React, { useState } from 'react';
import { addItem } from '../services/api';
import { useApp } from '../contexts/AppContext';

const AddItemForm = ({ onItemAdded }) => {
  const { user } = useApp();
  const [url, setUrl] = useState('');
  const [desiredPrice, setDesiredPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Введите URL или артикул товара');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await addItem({
        telegram_id: user.telegram_id,
        wb_url: url.trim(),
        desired_price: desiredPrice ? parseFloat(desiredPrice) : undefined
      });
      
      if (result.success) {
        setUrl('');
        setDesiredPrice('');
        setIsExpanded(false);
        onItemAdded(result.item);
      } else {
        setError(result.error || 'Не удалось добавить товар');
      }
    } catch (err) {
      setError('Произошла ошибка при добавлении товара');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <button 
        onClick={() => setIsExpanded(true)} 
        className="w-full mb-6 py-4 bg-purple-800 hover:bg-purple-900 text-white font-medium rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all duration-300"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Добавить товар для отслеживания
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-purple-900">Добавление товара</h2>
        <button 
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="url" className="block mb-2 text-sm font-medium text-gray-700">
            URL или артикул Wildberries
          </label>
          <input
            type="text"
            id="url"
            className="bg-gray-50 text-gray-800 border border-gray-200 rounded-xl py-3 px-4 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="https://www.wildberries.ru/catalog/12345/detail.aspx или 12345"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="mb-5">
          <label htmlFor="desiredPrice" className="block mb-2 text-sm font-medium text-gray-700">
            Желаемая цена (опционально)
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            id="desiredPrice"
            className="bg-gray-50 text-gray-800 border border-gray-200 rounded-xl py-3 px-4 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Например, 1000"
            value={desiredPrice}
            onChange={(e) => {
              // Only allow numeric input
              const value = e.target.value.replace(/[^0-9]/g, '');
              setDesiredPrice(value);
            }}
            disabled={loading}
            style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Оставьте пустым для автоматической установки (скидка 10%)
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all duration-200"
            onClick={() => setIsExpanded(false)}
            disabled={loading}
          >
            Отмена
          </button>
          
          <button
            type="submit"
            className="flex-1 py-3 px-5 bg-purple-800 hover:bg-purple-900 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Добавление...
              </>
            ) : 'Добавить товар'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItemForm;
