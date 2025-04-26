import React, { useState, useRef, useEffect } from 'react';

const ItemCard = ({ item, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // --- Состояние для свайпа ---
  const [translateX, setTranslateX] = useState(0); // Текущее смещение контента
  const [isSwiping, setIsSwiping] = useState(false); // Флаг активного свайпа
  const [isRevealed, setIsRevealed] = useState(false); // Флаг, показана ли кнопка
  const startX = useRef(0); // Начальная координата X при касании/клике
  const currentTranslateX = useRef(0); // Сохраняем смещение между рендерами во время свайпа
  const cardContentRef = useRef(null); // Ref для контента, который будем двигать
  const revealWidth = 80; // Ширина кнопки "Удалить" (в пикселях)

  // --- Форматирование цен и дат (остается как было) ---
  const priceFormatted = new Intl.NumberFormat('ru-RU', { /* ... */ }).format(item.current_price);
  const desiredPriceFormatted = new Intl.NumberFormat('ru-RU', { /* ... */ }).format(item.desired_price);
  const discount = item.current_price > 0 ? 100 - Math.round((item.desired_price / item.current_price) * 100) : 0;
  const isPriceReached = item.current_price <= item.desired_price;
  const lastCheckedDate = new Date(item.last_checked);
  const formattedDate = lastCheckedDate.toLocaleDateString('ru-RU', { /* ... */ });

  // --- Логика свайпа ---

  const handleSwipeStart = (clientX) => {
    if (isRevealed) return; // Не начинаем новый свайп, если уже открыто
    startX.current = clientX;
    setIsSwiping(true);
    // Убираем transition на время свайпа для мгновенного отклика
    if (cardContentRef.current) {
      cardContentRef.current.style.transition = 'none';
    }
    document.addEventListener('mousemove', handleSwipeMoveMouse);
    document.addEventListener('mouseup', handleSwipeEndMouse);
    document.addEventListener('touchmove', handleSwipeMoveTouch, { passive: false }); // passive: false для предотвращения скролла страницы при свайпе
    document.addEventListener('touchend', handleSwipeEndTouch);
  };

  const handleSwipeMove = (clientX) => {
    if (!isSwiping) return;

    const diff = clientX - startX.current;
    // Позволяем двигать только влево (diff < 0) и не больше ширины кнопки
    const newTranslateX = Math.max(-revealWidth, Math.min(0, currentTranslateX.current + diff));
    setTranslateX(newTranslateX);
  };

  const handleSwipeEnd = () => {
    if (!isSwiping) return;

    setIsSwiping(false);
    currentTranslateX.current = translateX; // Сохраняем конечное положение

    // Добавляем transition обратно для анимации "доводки"
    if (cardContentRef.current) {
      cardContentRef.current.style.transition = 'transform 0.3s ease-out';
    }

    // Логика "доводки": если сдвинули больше чем на половину, открываем полностью, иначе закрываем
    if (translateX < -revealWidth / 2) {
      setTranslateX(-revealWidth);
      currentTranslateX.current = -revealWidth;
      setIsRevealed(true);
    } else {
      setTranslateX(0);
      currentTranslateX.current = 0;
      setIsRevealed(false);
    }

    // Убираем глобальные слушатели
    document.removeEventListener('mousemove', handleSwipeMoveMouse);
    document.removeEventListener('mouseup', handleSwipeEndMouse);
    document.removeEventListener('touchmove', handleSwipeMoveTouch);
    document.removeEventListener('touchend', handleSwipeEndTouch);
  };

  // --- Обертки для событий мыши и касаний ---
  const handleTouchStart = (e) => {
    handleSwipeStart(e.touches[0].clientX);
  };
  const handleMouseDown = (e) => {
     // Игнорируем клики правой кнопкой мыши
     if (e.button !== 0) return;
    handleSwipeStart(e.clientX);
  };

  const handleSwipeMoveTouch = (e) => {
     // Предотвращаем скролл страницы, если свайп горизонтальный
     const currentX = e.touches[0].clientX;
     const diffX = Math.abs(currentX - startX.current);
     // Добавьте проверку на вертикальный свайп, если нужно его игнорировать
     // const currentY = e.touches[0].clientY;
     // const diffY = Math.abs(currentY - startY.current); // startY нужно будет сохранять в handleSwipeStart
     // if (diffY > diffX) return; // Если вертикальный свайп больше, ничего не делаем

     e.preventDefault(); // Предотвращаем стандартное поведение (скролл)
     handleSwipeMove(currentX);
   };
  const handleSwipeMoveMouse = (e) => {
    handleSwipeMove(e.clientX);
  };

  const handleSwipeEndTouch = () => {
    handleSwipeEnd();
  };
  const handleSwipeEndMouse = () => {
    handleSwipeEnd();
  };

  // Сброс состояния при клике вне карточки или при скролле (опционально)
  useEffect(() => {
    const handleClickOutside = (event) => {
        // Если клик был вне компонента и он открыт, закрываем
        if (isRevealed && cardContentRef.current && !cardContentRef.current.contains(event.target) && !event.target.closest('.delete-button-container')) { // Добавляем проверку на кнопку
            resetSwipe();
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    // Можно добавить слушатель скролла, чтобы закрывать при скролле
    // window.addEventListener('scroll', resetSwipe);

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
        // window.removeEventListener('scroll', resetSwipe);
        // Убираем глобальные слушатели на всякий случай при размонтировании
        document.removeEventListener('mousemove', handleSwipeMoveMouse);
        document.removeEventListener('mouseup', handleSwipeEndMouse);
        document.removeEventListener('touchmove', handleSwipeMoveTouch);
        document.removeEventListener('touchend', handleSwipeEndTouch);
    };
  }, [isRevealed]); // Перезапускаем эффект при изменении isRevealed

  const resetSwipe = () => {
    if (cardContentRef.current) {
        cardContentRef.current.style.transition = 'transform 0.3s ease-out';
    }
    setTranslateX(0);
    currentTranslateX.current = 0;
    setIsRevealed(false);
    setIsSwiping(false); // Убедимся, что свайп не активен
  }


  const toggleExpand = (e) => {
    // Не расширяем карточку, если свайпнули или кликнули по ссылке/кнопке
    if (translateX !== 0 || isSwiping || e.target.closest('a, button')) {
        if (isRevealed && !e.target.closest('.delete-button-container')) {
            // Если карточка была открыта (revealed) и клик не по кнопке удаления, закрываем ее
            resetSwipe();
        }
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Важно: предотвратить срабатывание onClick на карточке
    if (confirm('Вы действительно хотите удалить этот товар из отслеживания?')) {
      onDelete(item.id);
      // Можно добавить сброс свайпа после удаления, если элемент не удаляется сразу
      // resetSwipe();
    } else {
        // Если пользователь отменил удаление, закрываем кнопку
        resetSwipe();
    }
  };

  return (
    // --- Основной контейнер ---
    <div className="relative mb-4 overflow-hidden rounded-xl shadow-md bg-white">

      {/* --- Кнопка "Удалить" (позиционируется абсолютно сзади) --- */}
      <div
        className="delete-button-container absolute top-0 right-0 h-full w-[80px] bg-red-500 flex items-center justify-center text-white cursor-pointer"
        onClick={handleDeleteClick} // Обработчик клика на контейнер кнопки
        style={{ width: `${revealWidth}px` }} // Устанавливаем ширину из переменной
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {/* Можно добавить текст "Удалить" */}
        {/* <span className="ml-2 text-sm">Удалить</span> */}
      </div>

      {/* --- Контент карточки (сдвигаемая часть) --- */}
      <div
        ref={cardContentRef}
        className={`relative z-10 bg-white rounded-xl transition-transform duration-300 ease-out border ${isPriceReached ? 'border-green-300' : 'border-gray-100'} ${isExpanded ? 'expanded-card-styles' : ''} ${isPriceReached && !isExpanded ? 'bg-green-50' : 'bg-white'}`} // Добавили bg-white чтобы перекрыть кнопку
        style={{ transform: `translateX(${translateX}px)` }}
        onClick={toggleExpand}
        onMouseDown={handleMouseDown} // Для мыши
        onTouchStart={handleTouchStart} // Для тач-устройств
        // Не добавляйте onMouseLeave={handleSwipeEnd} сюда, используем глобальные слушатели
      >
        <div className="p-4"> {/* Внутренний отступ */}
          {isPriceReached && (
            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-20"> {/* Добавим z-index */}
              Цена снижена!
            </div>
          )}

          <div className="flex gap-4">
            <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 overflow-hidden rounded-xl shadow-sm border border-gray-100 bg-white">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-contain" // Убрал hover:scale-110 т.к. может конфликтовать с перетаскиванием
                draggable="false" // Предотвратить стандартное перетаскивание картинки
                onError={(e) => { /* ... */ }}
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

          {/* Убираем старую кнопку удаления из развернутого состояния */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-100">
               <div className="flex justify-between items-center mb-3">
                   <span className="text-xs text-gray-500">
                     Последняя проверка: {formattedDate}
                   </span>
                    {/* Старая кнопка здесь больше не нужна */}
               </div>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-sm mt-2 py-3 px-5 bg-purple-800 hover:bg-purple-900 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                onClick={(e) => e.stopPropagation()} // Предотвращаем схлопывание карточки при клике на ссылку
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
