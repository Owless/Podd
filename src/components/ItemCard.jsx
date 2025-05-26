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
  const DELETE_BTN_WIDTH = 80;
  const SWIPE_THRESHOLD = DELETE_BTN_WIDTH * 0.7;
  const MAX_SWIPE = DELETE_BTN_WIDTH * 1.2;

  const isExpanded = item.id === expandedItemId;

  // Memoize formatted prices to prevent unnecessary re-renders
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

  // Memoize calculated values
  const itemInfo = React.useMemo(() => {
    const discount = item.current_price > 0 
      ? Math.round(100 - (item.desired_price / item.current_price * 100))
      : 0;
    const isPriceReached = item.current_price <= item.desired_price && item.current_price > 0;
    
    return { discount, isPriceReached };
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
      deleteBtnRef.current.style.opacity = `${0.5 + progress * 0.5}`;
    }
  };

  const handleEnd = () => {
    if (!isDragging || isDeleting) return;
    setIsDragging(false);
    
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.2s ease-out';
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
      console.log('Deleting item:', item.id);
      
      // Call the delete function
      await onDelete(item.id);
      
      // Add a small delay to ensure the API call completes
      setTimeout(() => {
        setIsDeleting(false);
      }, 500);
      
    } catch (error) {
      console.error('Error deleting item:', error);
      setIsDeleting(false);
      resetPosition();
    }
  };

  const handleCardClick = (e) => {
    if (isDeleting) return;
    
    // If card is swiped, reset position instead of expanding
    if (Math.abs(position) > 10) {
      resetPosition();
      return;
    }
    
    // Don't expand if clicking on links or buttons
    if (e.target.closest('a') || e.target.closest('button')) return;
    
    // Toggle expansion
    if (isExpanded) {
      setExpandedItemId(null);
    } else {
      setExpandedItemId(item.id);
    }
  };

  // Update card position when the position state changes
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${position}px)`;
    }
  }, [position]);

  // Handle touch/mouse events
  useEffect(() => {
    const handleMouseMove = (e) => handleMove(e.clientX);
    const handleTouchMove = (e) => {
      // Prevent scrolling only on significant movement
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

  // Reset position when item changes
  useEffect(() => {
    resetPosition();
  }, [item.id]);

  return (
    <div className={`relative mb-3 overflow-hidden rounded-lg bg-white shadow-sm ${isDeleting ? 'opacity-50' : ''}`}>
      {/* Delete button */}
      <button
        ref={deleteBtnRef}
        className="absolute top-0 right-0 h-full w-20 bg-red-500 flex items-center justify-center text-white cursor-pointer disabled:opacity-50"
        onClick={handleDeleteClick}
        disabled={isDeleting}
        style={{ pointerEvents: position < -SWIPE_THRESHOLD ? 'auto' : 'none' }}
      >
        <div className="flex flex-col items-center">
          {isDeleting ? (
            <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
          <span className="text-xs mt-1">
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </span>
        </div>
      </button>

      {/* Main card content */}
      <div
        ref={cardRef}
        className={`relative z-10 bg-white rounded-lg border transition-colors ${
          itemInfo.isPriceReached ? 'border-green-300 bg-green-50' : 'border-gray-200'
        } ${isDeleting ? 'pointer-events-none' : 'cursor-pointer'}`}
        style={{ transform: `translateX(${position}px)` }}
        onClick={handleCardClick}
        onMouseDown={(e) => !isDeleting && handleStart(e.clientX)}
        onTouchStart={(e) => !isDeleting && handleStart(e.touches[0].clientX)}
      >
        <div className="p-3">
          {/* Price reached indicator */}
          {itemInfo.isPriceReached && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              Цена снижена!
            </div>
          )}

          <div className="flex gap-3">
            {/* Product image */}
            <div className="w-16 h-16 flex-shrink-0 rounded-lg border border-gray-200 overflow-hidden bg-white">
              <img
                src={imgError ? '/api/placeholder/64/64' : item.image}
                alt={item.title}
                className="w-full h-full object-contain"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium mb-1.5 text-gray-800 line-clamp-2">
                {item.title}
              </h3>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <span className={`px-1.5 py-0.5 rounded-lg font-medium ${
                  itemInfo.isPriceReached ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {formattedPrices.current}
                </span>
                <span className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded-lg font-medium">
                  Ждем: {formattedPrices.desired}
                </span>
                <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-lg font-medium">
                  -{itemInfo.discount}%
                </span>
              </div>
            </div>
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-100 animate-fadeIn">
              <div className="text-xs text-gray-500 mb-2">
                Проверено: {new Date(item.last_checked).toLocaleString('ru-RU')}
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-center transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Открыть товар
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Optimized memo comparison
export default memo(ItemCard, (prevProps, nextProps) => {
  // Return true if component should NOT re-render
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
