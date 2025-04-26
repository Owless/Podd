import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, User } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  const tabs = [
    {
      path: '/',
      name: 'Главная',
      icon: Home,
    },
    {
      path: '/referrals',
      name: 'Рефералы',
      icon: Users,
    },
    {
      path: '/profile',
      name: 'Профиль',
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.path;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab(tab.path)}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className="text-xs mt-1">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
