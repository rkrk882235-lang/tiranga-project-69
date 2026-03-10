import { ReactNode } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Header />
      <Navigation />
      <main
        style={{
          marginLeft: '250px',
          marginTop: '64px',
          padding: '24px',
          minHeight: 'calc(100vh - 64px)',
        }}
        className="main-content"
      >
        {children}
      </main>
      <style>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            margin-bottom: 80px;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
