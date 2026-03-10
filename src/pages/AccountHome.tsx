import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusChip } from '../components/ui/StatusChip';
import { Button } from '../components/ui/Button';
import { Order, Return, Notification, UserProfile } from '../lib/types';

export function AccountHome() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [openReturns, setOpenReturns] = useState<Return[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [profileData, ordersData, returnsData, notificationsData] = await Promise.all([
        supabase.from('user_profile').select('*').eq('user_id', user!.id).maybeSingle(),
        supabase
          .from('orders')
          .select('*')
          .eq('user_id', user!.id)
          .order('placed_at', { ascending: false })
          .limit(3),
        supabase
          .from('returns')
          .select('*')
          .eq('user_id', user!.id)
          .in('status', ['REQUESTED', 'APPROVED', 'PICKUP_SCHEDULED', 'PICKED_UP'])
          .limit(3),
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user!.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (profileData.data) setProfile(profileData.data as UserProfile);
      if (ordersData.data) setRecentOrders(ordersData.data as Order[]);
      if (returnsData.data) setOpenReturns(returnsData.data as Return[]);
      if (notificationsData.data) setNotifications(notificationsData.data as Notification[]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading your account...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
        Hi, {profile?.first_name || 'there'}
      </h1>
      <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '32px' }}>
        Welcome to your account dashboard
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#6B7280' }}>
                No orders yet. When you place an order, you'll see it here.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentOrders.map((order) => (
                  <Link
                    key={order.order_id}
                    to={`/orders/${order.order_id}`}
                    style={{
                      display: 'block',
                      padding: '12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#111827' }}>
                        Order #{order.order_number}
                      </span>
                      <StatusChip status={order.status} variant="order" />
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>
                      {new Date(order.placed_at).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginTop: '4px' }}>
                      {order.currency_code} {order.total_amount.toFixed(2)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link to="/orders" style={{ display: 'block', marginTop: '16px', color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
              View all orders →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Returns & Refunds</CardTitle>
          </CardHeader>
          <CardContent>
            {openReturns.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#6B7280' }}>
                No active returns
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {openReturns.map((returnItem) => (
                  <Link
                    key={returnItem.return_id}
                    to={`/returns/${returnItem.return_id}`}
                    style={{
                      display: 'block',
                      padding: '12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>Return #{returnItem.return_number}</span>
                      <StatusChip status={returnItem.status} variant="return" />
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>
                      Refund: {returnItem.refund_amount.toFixed(2)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link to="/returns" style={{ display: 'block', marginTop: '16px', color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
              View all returns →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#6B7280' }}>
                No new notifications
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.notification_id}
                    style={{
                      padding: '12px',
                      backgroundColor: '#EFF6FF',
                      borderRadius: '6px',
                      borderLeft: '3px solid #2563EB',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '4px', color: '#111827' }}>
                      {notification.title}
                    </div>
                    <div style={{ fontSize: '14px', color: '#374151' }}>
                      {notification.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/notifications" style={{ display: 'block', marginTop: '16px', color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
              View all notifications →
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Link to="/addresses" style={{ textDecoration: 'none' }}>
              <Button variant="outline" fullWidth>
                📍 Manage Addresses
              </Button>
            </Link>
            <Link to="/payments" style={{ textDecoration: 'none' }}>
              <Button variant="outline" fullWidth>
                💳 Payment Methods
              </Button>
            </Link>
            <Link to="/wishlist" style={{ textDecoration: 'none' }}>
              <Button variant="outline" fullWidth>
                ❤️ My Wishlist
              </Button>
            </Link>
            <Link to="/settings" style={{ textDecoration: 'none' }}>
              <Button variant="outline" fullWidth>
                ⚙️ Account Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {(!profile?.email_verified || !profile?.phone_verified) && (
        <Card style={{ marginTop: '24px', backgroundColor: '#FEF3C7', border: '1px solid #F59E0B' }}>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                  Protect your account: verify your contact information
                </div>
                <div style={{ fontSize: '14px', color: '#92400E' }}>
                  {!profile?.email_verified && 'Verify your email address. '}
                  {!profile?.phone_verified && 'Verify your phone number. '}
                  This helps keep your account secure.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
