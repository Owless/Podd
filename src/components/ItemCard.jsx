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

  // ... (остальные переменные и форматирование остаются такими же)

  // Объединенная логика свайпа
  const handleSwipeStart = (clientX) => {
    startX.current = clientX;
    setIsSwiping(true);
    setIsRevealed(false); // Сбрасываем состояние фиксации при начале нового свайпа
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
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const diff = clientX - startX.current;
    let newTranslateX = currentTranslateX.current + diff;
    
    // Ограничиваем максимальное смещение
    newTranslateX = Math.max(deleteThreshold, Math.min(0, newTranslateX));
    
    setTranslateX(newTranslateX);
    
    // Визуальная обратная связь
    if (cardContentRef.current) {
      const deleteButton = cardContentRef.current.previousElementSibling;
      if (deleteButton) {
        // Изменяем цвет кнопки при приближении к порогу удаления
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
      // Если свайпнули до порога удаления - показываем подтверждение
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

  // ... (остальные функции остаются такими же)

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl shadow-md bg-white">
      {/* Кнопка удаления (сзади) */}
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

      {/* Контент карточки (сдвигаемый) */}
      <div
        ref={cardContentRef}
        className={`relative z-10 bg-white rounded-xl border ${isPriceReached ? 'border-green-300' : 'border-gray-100'} ${
          isPriceReached && !isExpanded ? 'bg-green-50' : 'bg-white'
        }`}
        style={{ transform: `translateX(${translateX}px)` }}
        onClick={handleCardClick}
        onMouseDown={(e) => e.button === 0 && handleSwipeStart(e.clientX)}
        onTouchStart={(e) => handleSwipeStart(e.touches[0].clientX)}
      >
        {/* ... (остальное содержимое карточки остается таким же) */}
      </div>
    </div>
  );
};

export default ItemCard;
