// Panel de administración — solo para rol ADMIN

import { useEffect, useState } from 'react';
import { AdminService } from '../services';
import { Layout } from '../components/Layout';
import { formatCurrency, formatDate } from '../hooks';
import type { AdminStats, FailedTransaction } from '../types';
import styles from './AdminPage.module.css';

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className={styles.statCard} style={{ borderTopColor: color }}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  );
}

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [failed, setFailed] = useState<FailedTransaction[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingFailed, setLoadingFailed] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    AdminService.getStats()
      .then((res) => { if (res.data) setStats(res.data); })
      .catch(() => setError('No se pudieron cargar las estadísticas'))
      .finally(() => setLoadingStats(false));

    AdminService.getFailedTransactions()
      .then((res) => { if (res.data) setFailed(res.data.transactions); })
      .catch(() => {})
      .finally(() => setLoadingFailed(false));
  }, []);

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <div className={styles.adminBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="currentColor"/>
              </svg>
              Panel de Administración
            </div>
            <h1 className={styles.title}>Resumen del sistema</h1>
            <p className={styles.subtitle}>Métricas y trazabilidad de PayFlow</p>
          </div>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Stats grid */}
        <div className={styles.statsGrid}>
          {loadingStats ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className={`${styles.statCard} skeleton`} style={{ height: 96 }} />
            ))
          ) : stats ? (
            <>
              <StatCard label="Usuarios" value={stats.totalUsers} color="var(--color-primary)" />
              <StatCard label="Wallets" value={stats.totalWallets} color="var(--color-accent)" />
              <StatCard label="Transacciones totales" value={stats.totalTransactions} color="var(--color-text-muted)" />
              <StatCard label="Exitosas" value={stats.successCount} color="var(--color-success)" sub={`${stats.totalTransactions ? Math.round((stats.successCount / stats.totalTransactions) * 100) : 0}% del total`} />
              <StatCard label="Fallidas" value={stats.failedCount} color="var(--color-error)" sub="Saldo insuficiente" />
            </>
          ) : null}
        </div>

        {/* Volume */}
        {stats && (
          <div className={styles.volumeCard}>
            <div className={styles.volumeLabel}>Volumen total procesado</div>
            <div className={styles.volumeAmount}>{formatCurrency(stats.totalVolume)}</div>
            <div className={styles.volumeSub}>En transacciones exitosas</div>
          </div>
        )}

        {/* Failed transactions table */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Transacciones fallidas
            {failed.length > 0 && (
              <span className="badge badge-error" style={{ marginLeft: 10 }}>{failed.length}</span>
            )}
          </h2>

          <div className={styles.tableCard}>
            {loadingFailed ? (
              <div className={styles.loading}>
                <span className="spinner spinner-dark" />
                <span>Cargando registros…</span>
              </div>
            ) : failed.length === 0 ? (
              <div className={styles.emptyFailed}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p>Sin transacciones fallidas. El sistema está limpio.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Emisor</th>
                    <th>Receptor</th>
                    <th>Monto</th>
                    <th>Concepto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {failed.map((tx) => (
                    <tr key={tx.id}>
                      <td className={styles.dateCell}>{formatDate(tx.createdAt)}</td>
                      <td>
                        <div className={styles.userCell}>
                          <span className={styles.userName}>{tx.sender.name}</span>
                          <span className={styles.userAlias}>{tx.sender.alias}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.userCell}>
                          <span className={styles.userName}>{tx.receiver.name}</span>
                          <span className={styles.userAlias}>{tx.receiver.alias}</span>
                        </div>
                      </td>
                      <td className={styles.amountCell}>{formatCurrency(tx.amount)}</td>
                      <td className={styles.conceptCell}>{tx.concept}</td>
                      <td><span className="badge badge-error">Fallida</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
