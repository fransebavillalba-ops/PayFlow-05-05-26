// BalanceCard v2 — muestra saldo, alias y CVU

import { useState } from 'react';
import type { Wallet } from '../types';
import { formatCurrency } from '../hooks';
import styles from './BalanceCard.module.css';

interface Props {
  wallet: Wallet | null;
  loading?: boolean;
}

export function BalanceCard({ wallet, loading }: Props) {
  const [copied, setCopied] = useState<'alias' | 'cvu' | null>(null);

  const copyToClipboard = (text: string, type: 'alias' | 'cvu') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  if (loading) {
    return (
      <div className={`${styles.card} ${styles.cardLoading}`}>
        <div className={`skeleton ${styles.skRow}`} style={{ width: '120px', height: '14px' }} />
        <div className={`skeleton ${styles.skRow}`} style={{ width: '220px', height: '44px', marginTop: '12px' }} />
        <div className={`skeleton ${styles.skRow}`} style={{ width: '180px', height: '14px', marginTop: '16px' }} />
      </div>
    );
  }

  if (!wallet) return null;

  return (
    <div className={styles.card}>
      <div className={styles.circle1} />
      <div className={styles.circle2} />

      <div className={styles.content}>
        <div className={styles.topRow}>
          <span className={styles.label}>Saldo disponible</span>
          <span className={styles.liveDot} title="Saldo en tiempo real" />
        </div>

        <div className={styles.balance}>{formatCurrency(wallet.balance)}</div>

        <div className={styles.divider} />

        <div className={styles.bottomRow}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Alias</span>
            <button
              className={`${styles.infoValue} mono ${styles.copyBtn}`}
              onClick={() => copyToClipboard(wallet.alias, 'alias')}
              title="Copiar alias"
            >
              {wallet.alias}
              <span className={styles.copyIcon}>{copied === 'alias' ? '✓' : '⎘'}</span>
            </button>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>CVU</span>
            <button
              className={`${styles.infoValue} ${styles.walletId} mono ${styles.copyBtn}`}
              onClick={() => copyToClipboard(wallet.cvu || '', 'cvu')}
              title="Copiar CVU"
            >
              {wallet.cvu ? wallet.cvu.slice(0, 10) + '…' : 'N/A'}
              <span className={styles.copyIcon}>{copied === 'cvu' ? '✓' : '⎘'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
