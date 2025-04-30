import React, { useState, useRef, useEffect, memo } from 'react';

const ItemCard = ({ item, onDelete, expandedItemId, setExpandedItemId }) => {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imgError, setImgError] = useState(false);
  const startPos = useRef(0);
  const cardRef = useRef(null);
  const deleteBtnRef = useRef(null);
  const previousItemRef = useRef(item);

  // Increase delete button width
  const DELETE_BTN_WIDTH = 80;
  // Increase swipe threshold to require user to swipe further
  const SWIPE_THRESHOLD = DELETE_BTN_WIDTH * 0.7;
  const MAX_SWIPE = DELETE_BTN_WIDTH * 1.2;

  const isExpanded = item.id === expandedItemId;

  // IMPORTANT: Only track meaningful price changes
  useEffect(() => {
    if (
      previousItemRef.current.current_price !== item.current_price ||
      previousItemRef.current.desired_price !== item.desired_price
    ) {
      console.log('Price changed:', {
        id: item.id,
        old_price: previousItemRef.current.current_price,
        new_price: item.current_price
      });
      // We need to update the reference so that next changes are detected properly
      previousItemRef.current = { ...item };
    }
  }, [item.current_price, item.desired_price, item.id]);

  // CRITICAL FIX: Pre-calculate values instead of recalculating on every render
  const formattedCurrentPrice = formatPrice(item.current_price);
  const formattedDesiredPrice = formatPrice(item.desired_price);
  const discount = calculateDiscount(item.current_price, item.desired_price);
  const isPriceReached = item.current_price <= item.desired_price && item.current_price > 0;

  // Format price function
  function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  }

  // Calculate discount function
  function calculateDiscount(currentPrice, desiredPrice) {
    if (currentPrice <= 0) return 0;
    return Math.round(100 - (desiredPrice / currentPrice * 100));
  }

  // Update DOM elements when position changes
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${position}px)`;
    }
    
    if (deleteBtnRef.current) {
      const progress = Math.min(1, Math.abs(position) / DELETE_BTN_WIDTH);
      deleteBtnRef.current.style.opacity = `${0.5 + progress * 0.5}`;
    }
  }, [position]);

  const handleStart = (clientX) => {
    startPos.current = clientX;
    setIsDragging(true);
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    
    const diff = clientX - startPos.current;
    let newPosition = diff;
    
    if (position < 0) {
      newPosition = position + diff;
    }
    
    newPosition = Math.min(0, Math.max(-MAX_SWIPE, newPosition));
    setPosition(newPosition);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.2s ease-out';
    }
    
    if (position <= -DELETE_BTN_WIDTH) {
      if (window.confirm('Удалить товар из отслеживания?')) {
        onDelete(item.id);
      } else {
        resetPosition();
      }
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

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm('Удалить товар из отслеживания?')) {
      onDelete(item.id);
    }
  };

  const handleCardClick = (e) => {
    if (Math.abs(position) > 10) {
      resetPosition();
      return;
    }
    
    if (e.target.closest('a') || e.target.closest('button')) return;
    
    if (isExpanded) {
      setExpandedItemId(null);
    } else {
      setExpandedItemId(item.id);
    }
  };

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
  }, [isDragging]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setPosition(0);
      setIsDragging(false);
    };
  }, []);

  return (
    <div className="relative mb-3 overflow-hidden rounded-lg bg-white shadow-sm">
      {/* Delete button */}
      <div
        ref={deleteBtnRef}
        className="absolute top-0 right-0 h-full w-20 bg-red-500 flex items-center justify-center text-white"
        onClick={handleDeleteClick}
      >
        <div className="flex flex-col items-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="text-xs mt-1">Удалить</span>
        </div>
      </div>

      {/* Item card */}
      <div
        ref={cardRef}
        className={`relative z-10 bg-white rounded-lg border ${
          isPriceReached ? 'border-green-300 bg-green-50' : 'border-gray-200'
        }`}
        style={{ transform: `translateX(${position}px)` }}
        onClick={handleCardClick}
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      >
        <div className="p-3">
          {isPriceReached && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              Цена снижена!
            </div>
          )}

          <div className="flex gap-3">
            <div className="w-16 h-16 flex-shrink-0 rounded-lg border border-gray-200 overflow-hidden bg-white">
              <img
                src={imgError ? 'https://via.placeholder.com/80?text=WB' : item.image}
                alt={item.title}
                className="w-full h-full object-contain"
                onError={() => setImgError(true)}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium mb-1.5 text-gray-800 line-clamp-2">
                {item.title}
              </h3>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <span className={`px-1.5 py-0.5 rounded-lg font-medium ${
                  isPriceReached ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {formattedCurrentPrice}
                </span>
                <span className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded-lg font-medium">
                  Ждем: {formattedDesiredPrice}
                </span>
                <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-lg font-medium">
                  -{discount}%
                </span>
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2">
                Проверено: {new Date(item.last_checked).toLocaleString('ru-RU')}
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-center"
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

// CRITICAL FIX: Properly implement memo to prevent unnecessary re-renders
export default memo(ItemCard, (prevProps, nextProps) => {
  // Return true if component should NOT re-render
  
  // Only re-render if:
  // 1. Item ID changes
  // 2. Current or desired price changes
  // 3. Expanded state changes for this specific item
  
  const priceUnchanged = 
    prevProps.item.current_price === nextProps.item.current_price &&
    prevProps.item.desired_price === nextProps.item.desired_price;
    
  const idUnchanged = prevProps.item.id === nextProps.item.id;
  
  // Handle expansion state: only care about expansion changes relevant to this item
  const wasExpanded = prevProps.expandedItemId === prevProps.item.id;
  const isExpanded = nextProps.expandedItemId === nextProps.item.id;
  const expansionUnchanged = wasExpanded === isExpanded;
  
  // Don't re-render if everything important is unchanged
  return idUnchanged && priceUnchanged && expansionUnchanged;
});
