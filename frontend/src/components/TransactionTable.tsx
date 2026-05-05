// TransactionTable v2 — muestra movimientos con estado y tipo

import type { Transaction } from '../types';
import { formatCurrency } from '../hooks';
import styles from './TransactionTable.module.css';

interface Props {
  transactions: Transaction[];
  loading?: boolean;
  emptyMessage?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  SUCCESS:    { label: 'Exitosa',    color: '#065F46', bg: '#D1FAE5' },
  FAILED:     { label: 'Fallida',    color: '#991B1B', bg: '#FEE2E2' },
  PENDING:    { label: 'Pendiente',  color: '#92400E', bg: '#FEF3C7' },
  PROCESSING: { label: 'En proceso', color: '#1E40AF', bg: '#DBEAFE' },
  CANCELLED:  { label: 'Cancelada',  color: '#6B7280', bg: '#F3F4F6' },
};

const TYPE_ICON: Record<string, string> = {
  TRANSFER:   '↔',
  DEPOSIT:    '↓',
  WITHDRAWAL: '↑',
};

export function TransactionTable({ transactions, loading, emptyMessage = 'Sin movimientos' }: Props) {
  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeletonRow}>
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '55%', height: 13, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: '35%', height: 11, borderRadius: 6, marginTop: 6 }} />
            </div>
            <div className="skeleton" style={{ width: 80, height: 20, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📭</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {transactions.map((tx) => {
        const isSent     = tx.direction === 'SENT';
        const isDeposit  = tx.type === 'DEPOSIT';
        const isWithdraw = tx.type === 'WITHDRAWAL';
        const statusMeta = STATUS_LABELS[tx.status] || STATUS_LABELS['PENDING'];

        return (
          <div key={tx.id} className={styles.row}>
            {/* Icono */}
            <div className={styles.iconWrap} style={{
              background: isDeposit ? '#D1FAE5' : isWithdraw ? '#FEE2E2' : isSent ? '#EDE9FE' : '#E8F0FF',
              color:      isDeposit ? '#065F46'  : isWithdraw ? '#991B1B'  : isSent ? '#7C3AED' : '#1D4ED8',
            }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{TYPE_ICON[tx.type] || '↔'}</span>
            </div>

            {/* Info */}
            <div className={styles.info}>
              <span className={styles.counterpart}>
                {isDeposit
                  ? 'Carga de saldo'
                  : isWithdraw
                  ? 'Retiro de saldo'
                  : isSent
                  ? `→ ${tx.receiverName}`
                  : `← ${tx.senderName}`}
              </span>
              <span className={styles.concept}>{tx.concept}</span>
              <span className={styles.date}>
                {new Date(tx.createdAt).toLocaleDateString('es-AR', {
                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>

            {/* Monto + estado */}
            <div className={styles.right}>
              <span className={styles.amount} style={{
                color: isDeposit ? '#065F46' : isWithdraw ? '#991B1B' : isSent ? '#EF4444' : '#10B981'
              }}>
                {isDeposit ? '+' : isWithdraw || isSent ? '-' : '+'}{formatCurrency(tx.amount)}
              </span>
              <span className={styles.status} style={{ color: statusMeta.color, background: statusMeta.bg }}>
                {statusMeta.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
