// Navbar superior fija — presente en todas las páginas autenticadas

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/dashboard" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 9h18M3 15h18M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className={styles.logoText}>PayFlow</span>
        </Link>

        {/* Nav links */}
        <nav className={styles.nav}>
          <Link to="/dashboard" className={`${styles.navLink} ${isActive('/dashboard') ? styles.active : ''}`}>
            Dashboard
          </Link>
          <Link to="/transfer" className={`${styles.navLink} ${isActive('/transfer') ? styles.active : ''}`}>
            Transferir
          </Link>
          <Link to="/history" className={`${styles.navLink} ${isActive('/history') ? styles.active : ''}`}>
            Historial
          </Link>
          {isAdmin && (
            <Link to="/admin" className={`${styles.navLink} ${styles.adminLink} ${isActive('/admin') ? styles.active : ''}`}>
              Admin
            </Link>
          )}
        </nav>

        {/* User section */}
        <div className={styles.userSection}>
          <div className={styles.avatar}>
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <span className={styles.userName}>{user?.name.split(' ')[0]}</span>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Cerrar sesión">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
