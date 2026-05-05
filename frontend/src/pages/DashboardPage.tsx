// Dashboard v2 — con depósito/retiro mock

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletService, TransactionService } from '../services';
import { useAuth } from '../context/AuthContext';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionTable } from '../components/TransactionTable';
import { Layout } from '../components/Layout';
import type { Wallet, Transaction } from '../types';
import styles from './DashboardPage.module.css';

type ModalType = 'deposit' | 'withdraw' | null;

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wallet, setWallet]           = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTx, setLoadingTx]     = useState(true);
  const [error, setError]             = useState('');
  const [modal, setModal]             = useState<ModalType>(null);
  const [fundAmount, setFundAmount]   = useState('');
  const [fundLoading, setFundLoading] = useState(false);
  const [fundMsg, setFundMsg]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadWallet = () => {
    setLoadingWallet(true);
    WalletService.getMyWallet()
      .then((res) => { if (res.data) setWallet(res.data); })
      .catch(() => setError('No se pudo cargar tu wallet'))
      .finally(() => setLoadingWallet(false));
  };

  useEffect(() => {
    loadWallet();
    TransactionService.getHistory(1, 5)
      .then((res) => { if (res.data) setTransactions(res.data.transactions); })
      .catch(() => {})
      .finally(() => setLoadingTx(false));
  }, []);

  const handleFund = async () => {
    const amt = Number(fundAmount);
    if (!amt || amt <= 0) { setFundMsg({ type: 'error', text: 'Ingresá un monto válido' }); return; }
    setFundLoading(true);
    setFundMsg(null);
    try {
      if (modal === 'deposit') {
        await TransactionService.deposit(amt, 'Carga de saldo');
        setFundMsg({ type: 'success', text: `Se acreditaron $${amt.toLocaleString('es-AR')} en tu cuenta` });
      } else {
        await TransactionService.withdraw(amt, 'Retiro de saldo');
        setFundMsg({ type: 'success', text: `Se extrajeron $${amt.toLocaleString('es-AR')} de tu cuenta` });
      }
      setFundAmount('');
      loadWallet();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFundMsg({ type: 'error', text: axiosErr.response?.data?.message || 'Error al procesar' });
    } finally {
      setFundLoading(false);
    }
  };

  const closeModal = () => { setModal(null); setFundAmount(''); setFundMsg(null); };

  return (
    <Layout>
      <div className={styles.page}>
        {/* Greeting */}
        <div className={styles.greeting}>
          <div>
            <h1 className={styles.greetTitle}>Hola, {user?.name.split(' ')[0]} 👋</h1>
            <p className={styles.greetSub}>Este es el resumen de tu cuenta</p>
          </div>
          {user?.role === 'ADMIN' && (
            <span className="badge badge-warning" style={{ alignSelf: 'flex-start', background: '#FEF3C7', color: '#92400E' }}>
              Admin
            </span>
          )}
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <BalanceCard wallet={wallet} loading={loadingWallet} />

        {/* Quick actions */}
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => navigate('/transfer')}>
            <div className={styles.actionIcon} style={{ background: '#E8F0FF', color: 'var(--color-primary)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Transferir</span>
          </button>

          <button className={styles.actionBtn} onClick={() => { setModal('deposit'); setFundMsg(null); }}>
            <div className={styles.actionIcon} style={{ background: '#E6FAF4', color: 'var(--color-success)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Cargar</span>
          </button>

          <button className={styles.actionBtn} onClick={() => { setModal('withdraw'); setFundMsg(null); }}>
            <div className={styles.actionIcon} style={{ background: '#FFF7ED', color: 'var(--color-warning)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 19V5M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Retirar</span>
          </button>

          <button className={styles.actionBtn} onClick={() => navigate('/history')}>
            <div className={styles.actionIcon} style={{ background: '#F3F4F6', color: '#6B7280' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 14l-4-4 4-4M15 10H5M15 6a7 7 0 1 1 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Historial</span>
          </button>

          {user?.role === 'ADMIN' && (
            <button className={styles.actionBtn} onClick={() => navigate('/admin')}>
              <div className={styles.actionIcon} style={{ background: '#FFFBEB', color: 'var(--color-warning)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>Admin</span>
            </button>
          )}
        </div>

        {/* Recent transactions */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Últimos movimientos</h2>
            <button className={styles.seeAll} onClick={() => navigate('/history')}>Ver todos →</button>
          </div>
          <div className={styles.card}>
            <TransactionTable transactions={transactions} loading={loadingTx} emptyMessage="Todavía no hiciste ninguna transferencia" />
          </div>
        </div>
      </div>

      {/* Modal depósito / retiro */}
      {modal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{modal === 'deposit' ? '💰 Cargar saldo' : '💸 Retirar saldo'}</h3>
              <button className={styles.modalClose} onClick={closeModal}>✕</button>
            </div>
            <p className={styles.modalSubtitle}>
              {modal === 'deposit'
                ? 'Simulá el ingreso de dinero a tu cuenta PayFlow'
                : 'Simulá el retiro de dinero desde tu cuenta PayFlow'}
            </p>
            <div className={styles.modalField}>
              <label>Monto</label>
              <div className={styles.modalAmountWrap}>
                <span>$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0,00"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            {fundMsg && (
              <div className={fundMsg.type === 'success' ? styles.modalSuccess : styles.modalError}>
                {fundMsg.text}
              </div>
            )}
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={closeModal}>Cancelar</button>
              <button className={styles.modalConfirm} onClick={handleFund} disabled={fundLoading}>
                {fundLoading ? 'Procesando…' : modal === 'deposit' ? 'Cargar' : 'Retirar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
