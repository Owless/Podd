import React, { useState } from 'react';

const ItemCard = ({ item, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
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
    
  // Определяем если цена снизилась до желаемой
  const isPriceReached = item.current_price <= item.desired_price;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm('Вы действительно хотите удалить этот товар из отслеживания?')) {
      onDelete(item.id);
    }
  };

  // Вывод даты последней проверки
  const lastCheckedDate = new Date(item.last_checked);
  const formattedDate = lastCheckedDate.toLocaleDateString('ru-RU', {
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      className={`bg-white rounded-xl p-4 mb-4 relative overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg border ${isPriceReached ? 'border-green-300 bg-green-50' : 'border-gray-100'}`}
      onClick={toggleExpand}
    >
      {isPriceReached && (
        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
          Цена снижена!
        </div>
      )}
      
      <div className="flex gap-4">
        <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 overflow-hidden rounded-xl shadow-sm border border-gray-100 bg-white">
          <img 
            src={item.image} 
            alt={item.title}
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/120?text=WB';
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm md:text-base font-medium mb-2 text-gray-800 line-clamp-2">
            {item.title}
          </h3>
          
          <div className="flex flex-wrap gap-2 text-xs">
            <span className={`px-2 py-1 rounded-xl font-medium ${isPriceReached ? 'bg-green-200 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
              {priceFormatted}
            </span>
            
            <span className="bg-purple-50 text-purple-800 px-2 py-1 rounded-xl font-medium border border-purple-200">
              Ожидаемая: {desiredPriceFormatted}
            </span>
            
            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-xl font-medium">
              Скидка: {discount}%
            </span>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-500">
              Последняя проверка: {formattedDate}
            </span>
            
            <button 
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full text-sm mt-2 py-3 px-5 bg-purple-800 hover:bg-purple-900 text-white font-medium rounded-xl flex items-center justify-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Открыть на Wildberries
          </a>
        </div>
      )}
    </div>
  );
};

export default ItemCard;
