// Página de Transferencias

import { useState, FormEvent, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TransactionService, WalletService } from '../services';
import { Layout } from '../components/Layout';
import { formatCurrency } from '../hooks';
import styles from './TransferPage.module.css';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function TransferPage() {
  const [alias, setAlias] = useState('');
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  // idempotencyKey se genera una sola vez por formulario para evitar doble envío
  const [idempotencyKey] = useState(() => uuidv4());

  // Lookup del destinatario cuando el alias tiene al menos 5 chars
  useEffect(() => {
    if (alias.length < 5) { setReceiverName(''); return; }
    const timer = setTimeout(async () => {
      setLookingUp(true);
      try {
        const res = await WalletService.findByAlias(alias);
        setReceiverName(res.data?.ownerName || '');
      } catch {
        setReceiverName('');
      } finally {
        setLookingUp(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [alias]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Validaciones
    if (!alias.trim()) { setStatus('error'); setMessage('Ingresá el alias del destinatario'); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setStatus('error'); setMessage('Ingresá un monto válido mayor a cero'); return; }
    if (!concept.trim()) { setStatus('error'); setMessage('Ingresá un concepto para la transferencia'); return; }

    setStatus('loading');
    try {
      const res = await TransactionService.transfer(
        alias.trim(),
        Number(amount),
        concept.trim(),
        idempotencyKey
      );
      if (res.success) {
        setStatus('success');
        setMessage(`Transferencia de ${formatCurrency(Number(amount))} realizada exitosamente`);
        setAlias('');
        setAmount('');
        setConcept('');
        setReceiverName('');
      }
    } catch (err: unknown) {
      setStatus('error');
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setMessage(axiosErr.response?.data?.message || 'Error al procesar la transferencia');
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setMessage('');
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nueva transferencia</h1>
          <p className={styles.subtitle}>Enviá dinero a cualquier cuenta PayFlow</p>
        </div>

        <div className={styles.formCard}>
          {status === 'success' ? (
            <div className={styles.successState}>
              <div className={styles.successIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className={styles.successTitle}>¡Transferencia enviada!</h2>
              <p className={styles.successMsg}>{message}</p>
              <button className={styles.newTransferBtn} onClick={resetForm}>
                Hacer otra transferencia
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Alias destinatario */}
              <div className={styles.field}>
                <label className={styles.label}>Alias del destinatario</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="nombre.apellido.1234"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value.toLowerCase())}
                    autoFocus
                  />
                  {lookingUp && <span className="spinner spinner-dark" style={{ position: 'absolute', right: 14 }} />}
                </div>
                {receiverName && (
                  <div className={styles.receiverBadge}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {receiverName}
                  </div>
                )}
              </div>

              {/* Monto */}
              <div className={styles.field}>
                <label className={styles.label}>Monto</label>
                <div className={styles.amountWrap}>
                  <span className={styles.currencySymbol}>$</span>
                  <input
                    type="number"
                    className={`${styles.input} ${styles.amountInput}`}
                    placeholder="0,00"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                {amount && Number(amount) > 0 && (
                  <span className={styles.amountPreview}>{formatCurrency(Number(amount))}</span>
                )}
              </div>

              {/* Concepto */}
              <div className={styles.field}>
                <label className={styles.label}>Concepto</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ej: Pago de alquiler, División de cena..."
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  maxLength={100}
                />
              </div>

              {/* Idempotency key (visible para fines académicos) */}
              <div className={styles.idempotencyInfo}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Clave anti-duplicado: <code>{idempotencyKey.slice(0, 16)}…</code></span>
              </div>

              {status === 'error' && message && (
                <div className={styles.errorBox}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {message}
                </div>
              )}

              <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <><span className="spinner" /> Procesando…</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Enviar transferencia
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
