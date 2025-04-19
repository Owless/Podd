import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-5 my-4 text-center">
      <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="font-semibold text-lg text-red-800 dark:text-red-200 mb-2">Что-то пошло не так</h3>
      <p className="text-red-600 dark:text-red-300 mb-4">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-red-100 hover:bg-red-200 text-red-800 py-2 px-4 rounded-full transition-colors duration-200 font-medium"
        >
          Попробовать снова
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
