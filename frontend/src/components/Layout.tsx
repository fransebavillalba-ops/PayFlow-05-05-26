// Layout principal: Navbar + contenido centrado

import { Navbar } from './Navbar';
import type { ReactNode } from 'react';
import styles from './Layout.module.css';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.root}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          {children}
        </div>
      </main>
    </div>
  );
}
