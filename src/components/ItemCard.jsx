import React from 'react';

const ItemCard = ({ item, onDelete }) => {
  const priceFormatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(item.current_price);

  const desiredPriceFormatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(item.desired_price);

  const discount = item.current_price > 0 
    ? 100 - Math.round((item.desired_price / item.current_price) * 100) 
    : 0;

  const handleDelete = () => {
    if (confirm('Вы действительно хотите удалить этот товар из отслеживания?')) {
      onDelete(item.id);
    }
  };

  return (
    <div className="card relative">
      <div className="absolute top-2 right-2">
        <button 
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700"
        >
          ✕
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover rounded"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/100?text=WB';
            }}
          />
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-1 text-telegram-text line-clamp-2">
            {item.title}
          </h3>
          
          <div className="flex flex-wrap gap-2 text-sm mt-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Текущая: {priceFormatted}
            </span>
            
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              Ожидаемая: {desiredPriceFormatted}
            </span>
            
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
              Скидка: {discount}%
            </span>
          </div>
          
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-telegram-link text-sm mt-2 inline-block"
          >
            Открыть на Wildberries
          </a>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;