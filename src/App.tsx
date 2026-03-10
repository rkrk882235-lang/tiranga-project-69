import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { AccountHome } from './pages/AccountHome';
import { Orders } from './pages/Orders';
import { Addresses } from './pages/Addresses';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { StubPage } from './pages/Stub';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/signin" element={user ? <Navigate to="/" replace /> : <SignIn />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignUp />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <AccountHome />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Layout>
              <Orders />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/:orderId"
        element={
          <ProtectedRoute>
            <Layout>
              <StubPage
                title="Order Details"
                description="View detailed information about your order, track shipments, download invoices, and manage cancellations or returns."
                icon="📦"
              />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/returns"
        element={
          <ProtectedRoute>
            <Layout>
              <StubPage
                title="Returns & Refunds"
                description="Manage your return requests, track refund status, and view return history. Request returns for eligible orders and choose replacement or refund options."
                icon="↩️"
              />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/addresses"
        element={
          <ProtectedRoute>
            <Layout>
              <Addresses />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <Layout>
              <StubPage
                title="Payment Methods"
                description="Manage your saved payment methods securely. Add cards, UPI, and other payment options. Set default payment method and manage refund instruments."
                icon="💳"
              />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <Layout>
              <StubPage
                title="Wishlist & Saved Items"
                description="View and manage items you've saved for later. Get notifications for price drops and back-in-stock alerts. Move items between wishlist and cart."
                icon="❤️"
              />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <Layout>
              <StubPage
                title="Your Reviews"
                description="Manage your product reviews and ratings. Write reviews for purchased items, upload photos, and track helpful votes on your reviews."
                icon="⭐"
              />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <StubPage
                title="Notifications"
                description="View all your notifications including order updates, delivery alerts, price drops, and account security notifications. Manage notification preferences."
                icon="🔔"
              />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Layout>
              <StubPage
                title="Messages & Support"
                description="View and manage conversations with customer support and sellers. Track open tickets, view message history, and get help with orders and returns."
                icon="💬"
              />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <StubPage
                title="Account Settings"
                description="Manage your profile, preferences, security settings, and privacy options. Update personal information, change password, enable 2FA, manage passkeys, and control communication preferences."
                icon="⚙️"
              />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
