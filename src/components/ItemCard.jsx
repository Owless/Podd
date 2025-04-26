import React, { useState, useRef, useEffect } from 'react';

const ItemCard = ({ item, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const startX = useRef(0);
  const currentTranslateX = useRef(0);
  const cardContentRef = useRef(null);

  // --- Константы для свайпа ---
  const revealWidth = 80; // Ширина кнопки "Удалить"
  const revealThreshold = -revealWidth / 2; // Порог для фиксации кнопки видимой
  const deleteThreshold = -revealWidth * 1.8; // Порог для немедленного удаления (подберите значение)

  // --- Форматирование и прочее (без изменений) ---
  const priceFormatted = /* ... */;
  const desiredPriceFormatted = /* ... */;
  const discount = /* ... */;
  const isPriceReached = /* ... */;
  const formattedDate = /* ... */;

  // --- Функция для подтверждения и удаления ---
  const confirmAndDelete = () => {
    // Добавляем небольшую задержку, чтобы пользователь успел увидеть результат свайпа перед диалогом
    setTimeout(() => {
      if (confirm('Вы действительно хотите удалить этот товар из отслеживания?')) {
        onDelete(item.id);
        // После успешного удаления сбрасывать состояние не обязательно, т.к. компонент исчезнет
      } else {
        // Если отменили, плавно возвращаем карточку назад
        resetSwipe();
      }
    }, 50); // Небольшая задержка 50ms
  };


  // --- Логика свайпа ---

  const handleSwipeStart = (clientX) => {
    // Сбрасываем предыдущее состояние revealed, если начинаем новый свайп не с открытой позиции
    if (currentTranslateX.current === 0) {
        setIsRevealed(false);
    }
    startX.current = clientX;
    setIsSwiping(true);
    if (cardContentRef.current) {
      cardContentRef.current.style.transition = 'none'; // Убираем анимацию на время перетаскивания
    }
    document.addEventListener('mousemove', handleSwipeMoveMouse, { passive: true }); // passive: true можно вернуть для мыши
    document.addEventListener('mouseup', handleSwipeEndMouse);
    document.addEventListener('touchmove', handleSwipeMoveTouch, { passive: false }); // passive: false важен для touch
    document.addEventListener('touchend', handleSwipeEndTouch);
  };

  const handleSwipeMove = (clientX) => {
    if (!isSwiping) return;

    const diff = clientX - startX.current;
    // Позволяем двигать влево, но ограничиваем максимальное смещение (например, deleteThreshold * 1.1)
    const newTranslateX = Math.max(deleteThreshold * 1.1, Math.min(0, currentTranslateX.current + diff));
    setTranslateX(newTranslateX);

     // --- Опционально: Визуальная обратная связь при пересечении порога удаления ---
     if (cardContentRef.current) {
         const deleteButton = cardContentRef.current.previousElementSibling; // Получаем контейнер кнопки удаления
         if (deleteButton) {
             if (newTranslateX <= deleteThreshold) {
                 deleteButton.classList.add('bg-red-700'); // Делаем фон темнее, когда готовы удалить
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
    // Сохраняем финальное смещение перед анимацией
    const finalTranslateX = translateX;
    currentTranslateX.current = finalTranslateX; // Обновляем ref для следующего свайпа

    // Возвращаем анимацию
    if (cardContentRef.current) {
      cardContentRef.current.style.transition = 'transform 0.3s ease-out';
      // Сбрасываем визуальную обратную связь для кнопки
       const deleteButton = cardContentRef.current.previousElementSibling;
       if (deleteButton) {
           deleteButton.classList.add('bg-red-500');
           deleteButton.classList.remove('bg-red-700');
       }
    }


    // 1. Проверяем, был ли свайп достаточным для немедленного удаления
    if (finalTranslateX <= deleteThreshold) {
      // Не вызываем resetSwipe здесь сразу, ждем результат confirm
      confirmAndDelete();
    }
    // 2. Проверяем, был ли свайп достаточным для показа кнопки
    else if (finalTranslateX < revealThreshold) {
      setTranslateX(-revealWidth); // Фиксируем в открытом положении
      currentTranslateX.current = -revealWidth;
      setIsRevealed(true);
    }
    // 3. Иначе (свайп был слишком коротким) - возвращаем назад
    else {
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

  // --- Обертки для событий мыши и касаний (без изменений) ---
  const handleTouchStart = (e) => handleSwipeStart(e.touches[0].clientX);
  const handleMouseDown = (e) => { if (e.button === 0) handleSwipeStart(e.clientX); };
  const handleSwipeMoveTouch = (e) => { e.preventDefault(); handleSwipeMove(e.touches[0].clientX); };
  const handleSwipeMoveMouse = (e) => handleSwipeMove(e.clientX);
  const handleSwipeEndTouch = () => handleSwipeEnd();
  const handleSwipeEndMouse = () => handleSwipeEnd();


  // --- Сброс состояния ---
  const resetSwipe = (animated = true) => {
    if (cardContentRef.current) {
        if (animated) {
            cardContentRef.current.style.transition = 'transform 0.3s ease-out';
        } else {
            cardContentRef.current.style.transition = 'none';
        }
    }
    setTranslateX(0);
    currentTranslateX.current = 0;
    setIsRevealed(false);
    setIsSwiping(false); // Убедимся, что флаг сброшен
  };

  // --- Закрытие при клике вне + сброс слушателей при размонтировании ---
   useEffect(() => {
     const handleClickOutside = (event) => {
       const cardNode = cardContentRef.current;
       const deleteButtonNode = cardNode?.previousElementSibling;

       // Проверяем, что клик был, что карточка открыта, и клик был *не* по самой карточке и *не* по кнопке удаления
       if (event && isRevealed && cardNode && !cardNode.contains(event.target) && deleteButtonNode && !deleteButtonNode.contains(event.target)) {
         resetSwipe();
       }
     };

     // Используем setTimeout чтобы добавить слушатели после текущего цикла событий (избегаем срабатывания на тот же клик/тап, который мог начать свайп)
     const timerId = setTimeout(() => {
         document.addEventListener('mousedown', handleClickOutside, true); // Используем capturing phase
         document.addEventListener('touchstart', handleClickOutside, true); // Используем capturing phase
     }, 0);


     return () => {
       clearTimeout(timerId);
       document.removeEventListener('mousedown', handleClickOutside, true);
       document.removeEventListener('touchstart', handleClickOutside, true);
       // Очистка глобальных слушателей move/end на случай размонтирования во время свайпа
       document.removeEventListener('mousemove', handleSwipeMoveMouse);
       document.removeEventListener('mouseup', handleSwipeEndMouse);
       document.removeEventListener('touchmove', handleSwipeMoveTouch);
       document.removeEventListener('touchend', handleSwipeEndTouch);
     };
   }, [isRevealed]); // Зависимость от isRevealed для добавления/удаления слушателя клика вне


  // --- Обработчики кликов ---
  const toggleExpand = (e) => {
    // Не реагируем на клик если идет свайп или карточка сдвинута
    if (isSwiping || currentTranslateX.current !== 0) {
        // Если кликнули на сдвинутую карточку (не на кнопку), закрываем ее
        if (!e.target.closest('.delete-button-container')) {
             resetSwipe();
        }
      return;
    }
    // Игнорируем клики по ссылкам/кнопкам внутри карточки при toggleExpand
    if (e.target.closest('a')) {
        return;
    }
    setIsExpanded(!isExpanded);
  };

  // Клик по красной кнопке
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Обязательно
    confirmAndDelete(); // Используем общую функцию подтверждения
  };

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl shadow-md bg-white"> {/* Контейнер с overflow */}

      {/* --- Кнопка "Удалить" --- */}
      <div
        // Добавляем transition для цвета фона для обратной связи
        className="delete-button-container transition-colors duration-100 ease-in-out absolute top-0 right-0 h-full bg-red-500 flex items-center justify-center text-white cursor-pointer"
        onClick={handleDeleteClick}
        style={{ width: `${revealWidth}px` }}
      >
        <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> {/* Добавил pointer-events-none для иконки */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>

      {/* --- Контент карточки --- */}
      <div
        ref={cardContentRef}
        // Убрал transition из классов, управляем им через style
        className={`relative z-10 bg-white rounded-xl border ${isPriceReached ? 'border-green-300' : 'border-gray-100'} ${isPriceReached && !isExpanded ? 'bg-green-50' : 'bg-white'}`}
        style={{ transform: `translateX(${translateX}px)` }} // Transition будет добавляться/убираться в JS
        onClick={toggleExpand}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
         {/* ... остальной JSX контента карточки без изменений ... */}
          <div className="p-4"> {/* Внутренний отступ */}
             {isPriceReached && ( /* ... значок цены ... */ )}
             <div className="flex gap-4">
               <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 overflow-hidden rounded-xl shadow-sm border border-gray-100 bg-white">
                 <img /* ... картинка ... */ draggable="false" />
               </div>
               <div className="flex-1 min-w-0">
                 <h3 /* ... заголовок ... */></h3>
                 <div /* ... цены и скидка ... */></div>
               </div>
             </div>
             {isExpanded && ( /* ... развернутое содержимое ... */ )}
           </div>
      </div>
    </div>
  );
};

export default ItemCard;
