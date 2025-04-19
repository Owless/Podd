import React, { useState } from 'react';
import { addItem } from '../services/api';
import { useApp } from '../contexts/AppContext';

const AddItemForm = ({ onItemAdded }) => {
  const { user } = useApp();
  const [url, setUrl] = useState('');
  const [desiredPrice, setDesiredPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Добавить товар</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="url" className="block mb-1 text-sm font-medium">
            URL или артикул Wildberries
          </label>
          <input
            type="text"
            id="url"
            className="input"
            placeholder="https://www.wildberries.ru/catalog/12345/detail.aspx или 12345"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="desiredPrice" className="block mb-1 text-sm font-medium">
            Желаемая цена (опционально)
          </label>
          <input
            type="number"
            id="desiredPrice"
            className="input"
            placeholder="Например, 1000"
            value={desiredPrice}
            onChange={(e) => setDesiredPrice(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-telegram-hint mt-1">
            Оставьте пустым для автоматической установки (скидка 10%)
          </p>
        </div>
        
        {error && (
          <div className="mb-4 text-red-500 text-sm">{error}</div>
        )}
        
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Добавление...' : 'Добавить товар'}
        </button>
      </form>
    </div>
  );
};

export default AddItemForm;