import React, { useState, useRef, useEffect } from 'react';

const ItemCard = ({ item, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const cardRef = useRef(null);
  const deleteBtnRef = useRef(null);

  // Константы для свайпа
  const DELETE_BTN_WIDTH = 80;
  const REVEAL_THRESHOLD = -DELETE_BTN_WIDTH / 2;
  const DELETE_THRESHOLD = -DELETE_BTN_WIDTH;

  // Форматирование данных
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

  const isPriceReached = item.current_price <= item.desired_price;

  const lastCheckedDate = new Date(item.last_checked);
  const formattedDate = lastCheckedDate.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const confirmDelete = () => {
    if (window.confirm('Удалить товар из отслеживания?')) {
      onDelete(item.id);
    } else {
      resetCardPosition();
    }
  };

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    currentX.current = translateX;
    setIsDragging(true);
    cardRef.current.style.transition = 'none';
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    startX.current = e.clientX;
    currentX.current = translateX;
    setIsDragging(true);
    cardRef.current.style.transition = 'none';
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    
    const diff = clientX - startX.current;
    let newX = currentX.current + diff;
    
    // Ограничиваем движение вправо и задаем "жесткость" при движении влево
    newX = Math.min(0, Math.max(-DELETE_BTN_WIDTH * 1.5, newX));
    
    setTranslateX(newX);
    
    // Изменяем цвет кнопки при приближении к порогу удаления
    if (deleteBtnRef.current) {
      const progress = Math.min(1, Math.abs(newX) / DELETE_BTN_WIDTH);
      deleteBtnRef.current.style.backgroundColor = `rgb(239, 68, 68, ${0.5 + progress * 0.5})`;
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    cardRef.current.style.transition = 'transform 0.3s ease-out';
    
    // Определяем конечное положение
    if (translateX <= DELETE_THRESHOLD) {
      confirmDelete();
    } else if (translateX < REVEAL_THRESHOLD) {
      setTranslateX(-DELETE_BTN_WIDTH);
    } else {
      resetCardPosition();
    }
  };

  const resetCardPosition = () => {
    setTranslateX(0);
    if (deleteBtnRef.current) {
      deleteBtnRef.current.style.backgroundColor = '#ef4444';
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    confirmDelete();
  };

  const handleCardClick = (e) => {
    if (Math.abs(translateX) > 10) {
      resetCardPosition();
      return;
    }
    
    if (e.target.closest('a')) return;
    
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl shadow-md bg-white">
      <div
        ref={deleteBtnRef}
        className="absolute top-0 right-0 h-full bg-red-500 flex items-center justify-center text-white cursor-pointer"
        style={{ width: `${DELETE_BTN_WIDTH}px` }}
        onClick={handleDeleteClick}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>

      <div
        ref={cardRef}
        className={`relative z-10 bg-white rounded-xl border ${isPriceReached ? 'border-green-300' : 'border-gray-100'} ${
          isPriceReached && !isExpanded ? 'bg-green-50' : 'bg-white'
        }`}
        style={{ transform: `translateX(${translateX}px)` }}
        onClick={handleCardClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="p-4">
          {isPriceReached && (
            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-20">
              Цена снижена!
            </div>
          )}

          <div className="flex gap-4">
            <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 overflow-hidden rounded-xl shadow-sm border border-gray-100 bg-white">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-contain"
                draggable="false"
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
      </div>
    </div>
  );
};

export default ItemCard;
