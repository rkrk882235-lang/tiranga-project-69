import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Account Home', path: '/', icon: '🏠' },
  { label: 'Orders', path: '/orders', icon: '📦' },
  { label: 'Returns & Refunds', path: '/returns', icon: '↩️' },
  { label: 'Addresses', path: '/addresses', icon: '📍' },
  { label: 'Payments', path: '/payments', icon: '💳' },
  { label: 'Wishlist', path: '/wishlist', icon: '❤️' },
  { label: 'Reviews', path: '/reviews', icon: '⭐' },
  { label: 'Notifications', path: '/notifications', icon: '🔔' },
  { label: 'Messages', path: '/messages', icon: '💬' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
];

export function Navigation() {
  const location = useLocation();

  return (
    <>
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 64,
          width: '250px',
          height: 'calc(100vh - 64px)',
          backgroundColor: '#fff',
          borderRight: '1px solid #E5E7EB',
          overflowY: 'auto',
          padding: '20px 0',
        }}
        className="desktop-nav"
      >
        <nav role="navigation" aria-label="Account navigation">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 24px',
                    color: location.pathname === item.path ? '#2563EB' : '#374151',
                    backgroundColor: location.pathname === item.path ? '#EFF6FF' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    borderLeft: location.pathname === item.path ? '3px solid #2563EB' : '3px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTop: '1px solid #E5E7EB',
          padding: '8px 0',
          display: 'none',
          zIndex: 1000,
        }}
        className="mobile-nav"
      >
        <nav role="navigation" aria-label="Mobile navigation">
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              justifyContent: 'space-around',
              overflowX: 'auto',
            }}
          >
            {navItems.slice(0, 5).map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    color: location.pathname === item.path ? '#2563EB' : '#6B7280',
                    textDecoration: 'none',
                    fontSize: '12px',
                    minWidth: '60px',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <span>{item.label.split(' ')[0]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }
          .mobile-nav {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
