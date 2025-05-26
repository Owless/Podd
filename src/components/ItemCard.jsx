import React, { useState, useRef, useEffect, memo } from 'react';

const ItemCard = ({ item, onDelete, expandedItemId, setExpandedItemId }) => {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const startPos = useRef(0);
  const cardRef = useRef(null);
  const deleteBtnRef = useRef(null);

  // Swipe configuration
  const DELETE_BTN_WIDTH = 100;
  const SWIPE_THRESHOLD = DELETE_BTN_WIDTH * 0.6;
  const MAX_SWIPE = DELETE_BTN_WIDTH * 1.3;

  const isExpanded = item.id === expandedItemId;

  // Memoize formatted prices
  const formattedPrices = React.useMemo(() => {
    const formatter = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    });
    
    return {
      current: formatter.format(item.current_price),
      desired: formatter.format(item.desired_price)
    };
  }, [item.current_price, item.desired_price]);

  // Улучшенная логика расчета
  const itemInfo = React.useMemo(() => {
    const currentPrice = item.current_price || 0;
    const desiredPrice = item.desired_price || 0;
    
    // Цена достигнута если текущая цена меньше или равна желаемой
    const isPriceReached = currentPrice > 0 && currentPrice <= desiredPrice;
    
    // Логика скидки
    let discount = 0;
    let discountType = 'none'; // 'discount', 'waiting', 'none'
    
    if (currentPrice > 0 && desiredPrice > 0) {
      if (currentPrice < desiredPrice) {
        // Цена уже ниже желаемой - показываем на сколько дешевле
        discount = Math.round(((desiredPrice - currentPrice) / desiredPrice) * 100);
        discountType = 'discount';
      } else if (currentPrice > desiredPrice) {
        // Цена выше желаемой - показываем сколько ждем скидки
        discount = Math.round(((currentPrice - desiredPrice) / currentPrice) * 100);
        discountType = 'waiting';
      }
    }
    
    // Статус товара
    let status = 'tracking';
    if (isPriceReached) {
      status = 'reached';
    } else if (currentPrice === 0) {
      status = 'unavailable';
    }
    
    return { 
      discount, 
      discountType, 
      isPriceReached, 
      status 
    };
  }, [item.current_price, item.desired_price]);

  const handleStart = (clientX) => {
    if (isDeleting) return;
    startPos.current = clientX;
    setIsDragging(true);
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  };

  const handleMove = (clientX) => {
    if (!isDragging || isDeleting) return;
    
    const diff = clientX - startPos.current;
    let newPosition = diff;
    
    if (position < 0) {
      newPosition = position + diff;
    }
    
    newPosition = Math.min(0, Math.max(-MAX_SWIPE, newPosition));
    setPosition(newPosition);
    
    if (deleteBtnRef.current) {
      const progress = Math.min(1, Math.abs(newPosition) / DELETE_BTN_WIDTH);
      deleteBtnRef.current.style.opacity = `${0.7 + progress * 0.3}`;
      deleteBtnRef.current.style.transform = `scale(${0.9 + progress * 0.1})`;
    }
  };

  const handleEnd = () => {
    if (!isDragging || isDeleting) return;
    setIsDragging(false);
    
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    if (position <= -DELETE_BTN_WIDTH) {
      handleDeleteClick();
    } else if (position <= -SWIPE_THRESHOLD) {
      setPosition(-DELETE_BTN_WIDTH);
    } else {
      resetPosition();
    }
  };

  const resetPosition = () => {
    setPosition(0);
    if (deleteBtnRef.current) {
      deleteBtnRef.current.style.opacity = '1';
      deleteBtnRef.current.style.transform = 'scale(1)';
    }
  };

  const handleDeleteClick = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isDeleting) return;
    
    const confirmed = window.confirm('Удалить товар из отслеживания?');
    if (!confirmed) {
      resetPosition();
      return;
    }
    
    try {
      setIsDeleting(true);
      await onDelete(item.id);
      setTimeout(() => setIsDeleting(false), 500);
    } catch (error) {
      console.error('Error deleting item:', error);
      setIsDeleting(false);
      resetPosition();
    }
  };

  const handleCardClick = (e) => {
    if (isDeleting || Math.abs(position) > 10) {
      resetPosition();
      return;
    }
    
    if (e.target.closest('a') || e.target.closest('button')) return;
    
    setExpandedItemId(isExpanded ? null : item.id);
  };

  // Update card position
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${position}px)`;
    }
  }, [position]);

  // Handle events
  useEffect(() => {
    const handleMouseMove = (e) => handleMove(e.clientX);
    const handleTouchMove = (e) => {
      if (Math.abs(e.touches[0].clientX - startPos.current) > 10) {
        e.preventDefault();
      }
      handleMove(e.touches[0].clientX);
    };
    const handleEndEvent = () => handleEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEndEvent);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEndEvent);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEndEvent);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEndEvent);
    };
  }, [isDragging, position, isDeleting]);

  useEffect(() => {
    resetPosition();
  }, [item.id]);

  // Получаем цвета для статуса
  const getStatusColors = () => {
    switch (itemInfo.status) {
      case 'reached':
        return {
          border: 'border-emerald-300',
          bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
          indicator: 'bg-gradient-to-r from-emerald-500 to-green-500'
        };
      case 'unavailable':
        return {
          border: 'border-gray-300',
          bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
          indicator: 'bg-gradient-to-r from-gray-400 to-slate-400'
        };
      default:
        return {
          border: 'border-slate-200',
          bg: 'bg-gradient-to-br from-white to-slate-50',
          indicator: 'bg-gradient-to-r from-blue-500 to-indigo-500'
        };
    }
  };

  const statusColors = getStatusColors();

  return (
    <div className={`relative mb-4 overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 ${isDeleting ? 'opacity-50 scale-95' : ''}`}>
      {/* Delete button */}
      <button
        ref={deleteBtnRef}
        className="absolute top-0 right-0 h-full w-25 bg-gradient-to-l from-red-500 to-red-600 flex items-center justify-center text-white cursor-pointer disabled:opacity-50 transition-all duration-200"
        onClick={handleDeleteClick}
        disabled={isDeleting}
        style={{ pointerEvents: position < -SWIPE_THRESHOLD ? 'auto' : 'none' }}
      >
        <div className="flex flex-col items-center">
          {isDeleting ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-7 h-7 drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
          <span className="text-xs mt-1 font-medium">
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </span>
        </div>
      </button>

      {/* Main card */}
      <div
        ref={cardRef}
        className={`relative z-10 rounded-2xl border-2 transition-all duration-300 ${statusColors.border} ${statusColors.bg} ${
          isDeleting ? 'pointer-events-none' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
        }`}
        onClick={handleCardClick}
        onMouseDown={(e) => !isDeleting && handleStart(e.clientX)}
        onTouchStart={(e) => !isDeleting && handleStart(e.touches[0].clientX)}
      >
        {/* Status indicator bar */}
        <div className={`h-1 w-full ${statusColors.indicator} rounded-t-xl`}></div>
        
        <div className="p-4">
          {/* Status badge */}
          {itemInfo.status === 'reached' && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg animate-pulse">
              🎉 Цена снижена!
            </div>
          )}
          
          {itemInfo.status === 'unavailable' && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-gray-400 to-slate-400 text-white text-xs px-3 py-1 rounded-full font-semibold">
              Недоступен
            </div>
          )}

          <div className="flex gap-4">
            {/* Product image */}
            <div className="w-20 h-20 flex-shrink-0 rounded-xl border-2 border-white shadow-md overflow-hidden bg-white">
              <img
                src={imgError ? '/api/placeholder/80/80' : item.image}
                alt={item.title}
                className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold mb-2 text-slate-800 line-clamp-2 leading-snug">
                {item.title}
              </h3>
              
              {/* Price tags */}
              <div className="flex flex-wrap gap-2 text-xs">
                {/* Current price */}
                <span className={`px-3 py-1.5 rounded-xl font-bold shadow-sm ${
                  itemInfo.status === 'reached' 
                    ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200' 
                    : itemInfo.status === 'unavailable'
                    ? 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border border-gray-200'
                    : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                }`}>
                  {itemInfo.status === 'unavailable' ? 'Нет в наличии' : formattedPrices.current}
                </span>
                
                {/* Desired price */}
                {itemInfo.status !== 'unavailable' && (
                  <span className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-3 py-1.5 rounded-xl font-bold border border-purple-200 shadow-sm">
                    Цель: {formattedPrices.desired}
                  </span>
                )}
                
                {/* Discount/waiting badge */}
                {itemInfo.discount > 0 && itemInfo.status !== 'unavailable' && (
                  <span className={`px-3 py-1.5 rounded-xl font-bold shadow-sm ${
                    itemInfo.discountType === 'discount'
                      ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200'
                      : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                  }`}>
                    {itemInfo.discountType === 'discount' 
                      ? `💰 Дешевле на ${itemInfo.discount}%`
                      : `⏳ Ждем скидку ${itemInfo.discount}%`
                    }
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-3 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Проверено: {new Date(item.last_checked).toLocaleString('ru-RU')}
              </div>
              
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Открыть товар</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Optimized memo
export default memo(ItemCard, (prevProps, nextProps) => {
  const itemUnchanged = 
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.current_price === nextProps.item.current_price &&
    prevProps.item.desired_price === nextProps.item.desired_price &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.notification_sent === nextProps.item.notification_sent;
    
  const propsUnchanged = 
    prevProps.expandedItemId === nextProps.expandedItemId &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.setExpandedItemId === nextProps.setExpandedItemId;
    
  return itemUnchanged && propsUnchanged;
});
