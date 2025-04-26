import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Замените на реальный API-вызов
        const response = await fetch('/api/profile');
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные профиля');
        }
        
        const data = await response.json();
        setProfile(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  if (loading) return <Layout><Loading /></Layout>;
  if (error) return <Layout><ErrorMessage message={error} /></Layout>;

  // Пример данных профиля на случай, если они не загружены
  const userProfile = profile || {
    name: 'Пользователь',
    email: 'user@example.com',
    joinDate: new Date().toISOString(),
    balance: 0,
    transactions: [],
    settings: {
      notifications: true,
      darkMode: false
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mb-20">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 text-xl font-bold mr-4">
                {userProfile.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold">{userProfile.name}</h1>
                <p className="text-blue-100">{userProfile.email}</p>
                <p className="text-xs mt-1">С нами с {formatDate(userProfile.joinDate)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex border-b">
            <button
              className={`px-4 py-3 flex-1 text-center font-medium ${
                activeTab === 'profile' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Профиль
            </button>
            <button
              className={`px-4 py-3 flex-1 text-center font-medium ${
                activeTab === 'transactions' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('transactions')}
            >
              Транзакции
            </button>
            <button
              className={`px-4 py-3 flex-1 text-center font-medium ${
                activeTab === 'settings' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              Настройки
            </button>
          </div>
          
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Ваш баланс</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">₽{userProfile.balance?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-gray-600 mt-1">Доступно для вывода</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded flex-1">Пополнить</button>
                  <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded flex-1">Вывести</button>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-4">Личная информация</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={userProfile.name}
                      readOnly 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={userProfile.email}
                      readOnly 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={userProfile.phone || '+7'}
                      readOnly 
                    />
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
                    Редактировать профиль
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'transactions' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">История транзакций</h2>
              
              {userProfile.transactions && userProfile.transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userProfile.transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(transaction.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{transaction.description}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} ₽
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status === 'completed' ? 'Выполнено' : 
                               transaction.status === 'pending' ? 'В обработке' : 'Отменено'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">У вас пока нет транзакций</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Настройки</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Уведомления</h3>
                    <p className="text-sm text-gray-600">Получать email-уведомления</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={userProfile.settings?.notifications} 
                      readOnly
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Темная тема</h3>
                    <p className="text-sm text-gray-600">Включить темную тему интерфейса</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={userProfile.settings?.darkMode} 
                      readOnly
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Безопасность</h3>
                  <button className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded mb-2">
                    Сменить пароль
                  </button>
                  <button className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded">
                    Двухфакторная аутентификация
                  </button>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <button className="text-red-600">
                    Выйти из аккаунта
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
