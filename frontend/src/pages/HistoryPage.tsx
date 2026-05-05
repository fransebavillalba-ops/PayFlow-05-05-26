// HistoryPage v2 — con filtros por fecha y tipo

import { useEffect, useState } from 'react';
import { TransactionService } from '../services';
import { Layout } from '../components/Layout';
import { TransactionTable } from '../components/TransactionTable';
import type { Transaction, Pagination } from '../types';
import styles from './HistoryPage.module.css';

export function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = (p = 1) => {
    setLoading(true);
    TransactionService.getHistory(p, 20, dateFrom || undefined, dateTo || undefined)
      .then((res) => {
        if (res.data) {
          setTransactions(res.data.transactions);
          setPagination(res.data.pagination);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const applyFilters = () => { setPage(1); load(1); };
  const clearFilters = () => { setDateFrom(''); setDateTo(''); setPage(1); load(1); };

  const goTo = (p: number) => { setPage(p); load(p); };

  return (
    <Layout>
      <div style={{ padding: '0 0 40px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Historial de movimientos</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4, fontSize: 14 }}>
            {pagination ? `${pagination.total} movimientos en total` : 'Cargando…'}
          </p>
        </div>

        {/* Filtros */}
        <div style={{ background: 'var(--color-surface)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-text-muted)' }}>Desde</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              style={{ border: '1.5px solid var(--color-border)', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: 'var(--color-text)', background: 'var(--color-bg)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-text-muted)' }}>Hasta</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              style={{ border: '1.5px solid var(--color-border)', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: 'var(--color-text)', background: 'var(--color-bg)' }} />
          </div>
          <button onClick={applyFilters}
            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Filtrar
          </button>
          {(dateFrom || dateTo) && (
            <button onClick={clearFilters}
              style={{ background: 'none', border: '1.5px solid var(--color-border)', borderRadius: 8, padding: '9px 14px', fontSize: 13, cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              Limpiar
            </button>
          )}
        </div>

        <div style={{ background: 'var(--color-surface)', borderRadius: 12, overflow: 'hidden' }}>
          <TransactionTable transactions={transactions} loading={loading} emptyMessage="No hay movimientos para el período seleccionado" />
        </div>

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
            <button disabled={page === 1} onClick={() => goTo(page - 1)}
              style={{ border: '1.5px solid var(--color-border)', background: 'none', borderRadius: 8, padding: '8px 14px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
              ← Anterior
            </button>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              Página {page} de {pagination.totalPages}
            </span>
            <button disabled={page === pagination.totalPages} onClick={() => goTo(page + 1)}
              style={{ border: '1.5px solid var(--color-border)', background: 'none', borderRadius: 8, padding: '8px 14px', cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer', opacity: page === pagination.totalPages ? 0.4 : 1 }}>
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
