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
  const revealThreshold = -revealWidth / 2; // Порог для фиксации кнопки (-40px)
  const deleteThreshold = -revealWidth * 1.5; // Порог для удаления (-120px)

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
    if (cardContentRef.current) {
      cardContentRef.current.style.transition = 'none';
    }
    
    // Добавляем глобальные слушатели
    document.addEventListener('mousemove', handleSwipeMove);
    document.addEventListener('mouseup', handleSwipeEnd);
    document.addEventListener('touchmove', handleSwipeMove, { passive: false });
    document.addEventListener('touchend', handleSwipeEnd);
  };

  const handleSwipeMove = (e) => {
    if (!isSwiping) return;
    
    // Получаем текущую позицию касания
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    
    // Предотвращаем скролл страницы при свайпе
    if (e.cancelable && Math.abs(clientX - startX.current) > 10) {
      e.preventDefault();
    }
    
    const diff = clientX - startX.current;
    const newTranslateX = Math.min(0, Math.max(deleteThreshold, currentTranslateX.current + diff));
    
    setTranslateX(newTranslateX);
    
    // Визуальная обратная связь при приближении к порогу удаления
    if (cardContentRef.current) {
      const deleteButton = cardContentRef.current.previousElementSibling;
      if (deleteButton) {
        const deleteProgress = Math.min(1, Math.abs(newTranslateX) / Math.abs(deleteThreshold));
        deleteButton.style.opacity = 0.5 + (deleteProgress * 0.5);
      }
    }
  };

  const handleSwipeEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    
    // Восстанавливаем анимацию
    if (cardContentRef.current) {
      cardContentRef.current.style.transition = 'transform 0.3s ease-out';
      const deleteButton = cardContentRef.current.previousElementSibling;
      if (deleteButton) {
        deleteButton.style.opacity = '1';
      }
    }
    
    // Определяем конечное состояние
    if (translateX <= deleteThreshold) {
      // Показываем подтверждение перед удалением
      confirmAndDelete();
    } else if (translateX < revealThreshold) {
      // Фиксируем кнопку открытой
      setTranslateX(-revealWidth);
      currentTranslateX.current = -revealWidth;
      setIsRevealed(true);
    } else {
      // Возвращаем карточку в исходное положение
      resetSwipe();
    }
    
    // Удаляем глобальные слушатели
    document.removeEventListener('mousemove', handleSwipeMove);
    document.removeEventListener('mouseup', handleSwipeEnd);
    document.removeEventListener('touchmove', handleSwipeMove);
    document.removeEventListener('touchend', handleSwipeEnd);
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
    // Игнорируем клики при свайпе или если карточка сдвинута
    if (isSwiping || currentTranslateX.current !== 0) {
      // Если кликнули на сдвинутую карточку (не на кнопку), закрываем ее
      if (!e.target.closest('.delete-button-container')) {
        resetSwipe();
      }
      return;
    }
    
    // Игнорируем клики по ссылкам
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
      // Очистка глобальных слушателей на случай размонтирования
      document.removeEventListener('mousemove', handleSwipeMove);
      document.removeEventListener('mouseup', handleSwipeEnd);
      document.removeEventListener('touchmove', handleSwipeMove);
      document.removeEventListener('touchend', handleSwipeEnd);
    };
  }, [isRevealed]);

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl shadow-md bg-white">
      <div
        className="delete-button-container absolute top-0 right-0 h-full bg-red-500 flex items-center justify-center text-white cursor-pointer"
        onClick={handleDeleteClick}
        style={{ width: `${revealWidth}px` }}
      >
        <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>

      <div
        ref={cardContentRef}
        className={`relative z-10 bg-white rounded-xl border ${isPriceReached ? 'border-green-300' : 'border-gray-100'} ${isPriceReached && !isExpanded ? 'bg-green-50' : 'bg-white'}`}
        style={{ transform: `translateX(${translateX}px)` }}
        onClick={handleCardClick}
        onMouseDown={(e) => e.button === 0 && handleSwipeStart(e.clientX)}
        onTouchStart={(e) => handleSwipeStart(e.touches[0].clientX)}
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
