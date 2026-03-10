import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  role?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', onClick, role, style }: CardProps) {
  const baseStyles: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '20px',
    transition: 'box-shadow 0.2s ease',
    ...style,
  };

  const hoverStyles: React.CSSProperties = onClick
    ? {
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }
    : {};

  return (
    <div
      className={className}
      style={baseStyles}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      role={role}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
}

export function CardHeader({ children }: CardHeaderProps) {
  return (
    <div style={{ marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
}

export function CardTitle({ children }: CardTitleProps) {
  return (
    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: ReactNode;
}

export function CardContent({ children }: CardContentProps) {
  return <div>{children}</div>;
}
