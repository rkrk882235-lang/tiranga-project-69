import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { StatusChip } from '../components/ui/StatusChip';
import { Input } from '../components/ui/Input';
import { Order } from '../lib/types';

export function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user!.id)
        .order('placed_at', { ascending: false });

      if (error) throw error;
      if (data) setOrders(data as Order[]);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading orders...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
        Your Orders
      </h1>

      <Card style={{ marginBottom: '24px' }}>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'end' }}>
            <Input
              placeholder="Search orders by order number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              label="Search"
            />
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '10px 14px',
                  fontSize: '16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  minWidth: '200px',
                }}
              >
                <option value="all">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent>
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
                {searchQuery || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
              </h3>
              <p style={{ color: '#6B7280' }}>
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : "When you place an order, you'll see it here"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map((order) => (
            <Card key={order.order_id}>
              <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
                      Order placed {new Date(order.placed_at).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>
                      Order #{order.order_number}
                    </div>
                  </div>
                  <StatusChip status={order.status} variant="order" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                      {order.currency_code} {order.total_amount.toFixed(2)}
                    </div>
                    {order.delivered_at && (
                      <div style={{ fontSize: '14px', color: '#059669', marginTop: '4px' }}>
                        Delivered on {new Date(order.delivered_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Link to={`/orders/${order.order_id}`} style={{ textDecoration: 'none' }}>
                    <button
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#2563EB',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      View Details
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
