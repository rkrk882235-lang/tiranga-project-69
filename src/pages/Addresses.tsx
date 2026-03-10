import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Address } from '../lib/types';

export function Addresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    recipient_name: '',
    phone_e164: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    postal_code: '',
    country_code: 'IN',
    delivery_instructions: '',
    is_default_shipping: false,
  });

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default_shipping', { ascending: false });

      if (error) throw error;
      if (data) setAddresses(data as Address[]);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('user_addresses')
          .update(formData)
          .eq('address_id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_addresses')
          .insert({ ...formData, user_id: user!.id });
        if (error) throw error;
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Delete this address? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('address_id', addressId);

      if (error) throw error;
      loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      recipient_name: '',
      phone_e164: '',
      line1: '',
      line2: '',
      city: '',
      region: '',
      postal_code: '',
      country_code: 'IN',
      delivery_instructions: '',
      is_default_shipping: false,
    });
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading addresses...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827' }}>
          Your Addresses
        </h1>
        <Button onClick={() => setShowForm(true)}>Add New Address</Button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: '24px' }}>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Address' : 'Add New Address'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Input
                  label="Label (Home, Work, etc.)"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
                <Input
                  label="Recipient Name"
                  required
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone_e164}
                  onChange={(e) => setFormData({ ...formData, phone_e164: e.target.value })}
                />
                <Input
                  label="Address Line 1"
                  required
                  value={formData.line1}
                  onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                />
                <Input
                  label="Address Line 2"
                  value={formData.line2}
                  onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                />
                <Input
                  label="City"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <Input
                  label="State/Region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                />
                <Input
                  label="Postal Code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
              </div>
              <Input
                label="Delivery Instructions"
                value={formData.delivery_instructions}
                onChange={(e) => setFormData({ ...formData, delivery_instructions: e.target.value })}
                helperText="Leave with security if not available, etc."
              />
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <Button type="submit">{editingId ? 'Update Address' : 'Save Address'}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {addresses.length === 0 ? (
        <Card>
          <CardContent>
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
                No addresses saved
              </h3>
              <p style={{ color: '#6B7280', marginBottom: '16px' }}>
                Add a shipping address for faster checkout
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
          {addresses.map((address) => (
            <Card key={address.address_id}>
              <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    {address.label && (
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#2563EB', marginBottom: '4px' }}>
                        {address.label}
                      </div>
                    )}
                    {address.is_default_shipping && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          backgroundColor: '#DBEAFE',
                          color: '#1E40AF',
                          fontSize: '12px',
                          borderRadius: '4px',
                          fontWeight: 500,
                        }}
                      >
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                  {address.recipient_name}
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>
                  {address.line1}
                  {address.line2 && <><br />{address.line2}</>}
                  <br />
                  {address.city}, {address.region} {address.postal_code}
                  <br />
                  {address.country_code}
                </div>
                {address.phone_e164 && (
                  <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '8px' }}>
                    📞 {address.phone_e164}
                  </div>
                )}
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(address.address_id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
