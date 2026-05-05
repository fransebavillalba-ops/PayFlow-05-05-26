// Página de Login

import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../services';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Completá todos los campos');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.login(email, password);
      if (res.success && res.data) {
        login(res.data.accessToken || res.data.token, res.data.user, res.data.refreshToken);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 9h18M3 15h18M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className={styles.logoText}>PayFlow</span>
        </div>

        <h1 className={styles.title}>Bienvenido de vuelta</h1>
        <p className={styles.subtitle}>Iniciá sesión para acceder a tu billetera</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className={styles.errorBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Iniciar sesión'}
          </button>
        </form>

        <p className={styles.footer}>
          ¿No tenés cuenta?{' '}
          <Link to="/register">Registrate gratis</Link>
        </p>

        {/* Demo credentials hint */}
        <div className={styles.demoHint}>
          <strong>Demo:</strong> juan@example.com / juan123
        </div>
      </div>
    </div>
  );
}
