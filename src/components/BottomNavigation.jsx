import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const BottomNavigation = () => {
  const { user } = useApp();

  if (!user) return null;

  return (
    <nav className="bottom-nav">
      <Link to="/" className="nav-item">
        Главная
      </Link>
      <Link to="/profile" className="nav-item">
        Профиль
      </Link>
      <Link to="/referrals" className="nav-item">
        Рефералы
      </Link>
    </nav>
  );
};

export default BottomNavigation;
