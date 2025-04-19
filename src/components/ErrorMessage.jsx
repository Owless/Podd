import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="p-4 bg-red-100 text-red-700 rounded-md my-4">
      <h3 className="font-semibold">Ошибка</h3>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;