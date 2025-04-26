import React, { useState, useRef, useEffect } from 'react';

const ItemCard = ({ item, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const startX = useRef(0);
  const currentTranslateX = useRef(0);
  const cardContentRef = useRef(null);

  // Константы для свайпа
  const revealWidth = 80; // Ширина кнопки "Удалить"
  const revealThreshold = -40; // Порог для фиксации кнопки (-40px)
  const deleteThreshold = -120; // Порог для удаления (-120px)

  // Форматирование цены и даты
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

  // Функция подтверждения удаления
  const confirmAndDelete = () => {
    if (window.confirm('Вы действительно хотите удалить этот товар из отслеживания?')) {
      onDelete(item.id);
    } else {
      resetSwipe();
    }
  };

  // Объединенная логика свайпа
  const handleSwipeStart = (clientX) => {
    startX.current = clientX;
    setIsSwiping(true);
    setIsRevealed(false);
    if (cardContentRef.current) {
      cardContentRef.current.style.transition = 'none';
    }
  };

  const handleSwipeMove = (clientX) => {
    if (!isSwiping) return;
    
    const diff = clientX - startX.current;
    let newTranslateX = currentTranslateX.current + diff;
    
    // Ограничиваем смещение
    newTranslateX = Math.max(deleteThreshold, Math.min(0, newTranslateX));
    
    setTranslateX(newTranslateX);
    
    // Визуальная обратная связь
    if (cardContentRef.current) {
      const deleteButton = cardContentRef.current.previousElementSibling;
      if (deleteButton) {
        if (newTranslateX <= deleteThreshold) {
          deleteButton.classList.add('bg-red-700');
          deleteButton.classList.remove('bg-red-500');
        } else {
          deleteButton.classList.add('bg-red-500');
          deleteButton.classList.remove('bg-red-700');
        }
      }
    }
  };

  const handleSwipeEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    
    // Восстанавливаем анимацию
    if (cardContentRef.current) {
      cardContentRef.current.style.transition = 'transform 0.3s ease-out';
    }
    
    // Определяем конечное состояние
    if (translateX <= deleteThreshold) {
      confirmAndDelete();
    } else if (translateX < revealThreshold) {
      setTranslateX(-revealWidth);
      currentTranslateX.current = -revealWidth;
      setIsRevealed(true);
    } else {
      resetSwipe();
    }
  };

  // Обработчики событий мыши и касаний
  const handleTouchStart = (e) => {
    handleSwipeStart(e.touches[0].clientX);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    handleSwipeMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    handleSwipeEnd();
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      handleSwipeStart(e.clientX);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleMouseMove = (e) => {
    handleSwipeMove(e.clientX);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    handleSwipeEnd();
  };

  // Сброс состояния свайпа
  const resetSwipe = (animated = true) => {
    if (cardContentRef.current) {
      cardContentRef.current.style.transition = animated ? 'transform 0.3s ease-out' : 'none';
    }
    setTranslateX(0);
    currentTranslateX.current = 0;
    setIsRevealed(false);
  };

  // Обработчик клика по кнопке удаления
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    confirmAndDelete();
  };

  // Обработчик клика по карточке
  const handleCardClick = (e) => {
    if (isSwiping || currentTranslateX.current !== 0) {
      if (!e.target.closest('.delete-button-container')) {
        resetSwipe();
      }
      return;
    }
    
    if (e.target.closest('a')) {
      return;
    }
    
    setIsExpanded(!isExpanded);
  };

  // Закрытие карточки при клике вне
  useEffect(() => {
    const handleClickOutside = (e) => {
      const cardNode = cardContentRef.current;
      const deleteButtonNode = cardNode?.previousElementSibling;
      
      if (isRevealed && cardNode && !cardNode.contains(e.target) && 
          deleteButtonNode && !deleteButtonNode.contains(e.target)) {
        resetSwipe();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isRevealed]);

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl shadow-md bg-white">
      <div
        className={`delete-button-container absolute top-0 right-0 h-full flex items-center justify-center text-white cursor-pointer transition-colors duration-200 ${
          isRevealed ? 'bg-red-600' : 'bg-red-500'
        }`}
        onClick={handleDeleteClick}
        style={{ width: `${revealWidth}px` }}
      >
        <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>

      <div
        ref={cardContentRef}
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
