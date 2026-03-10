import { Card, CardContent } from '../components/ui/Card';

interface StubPageProps {
  title: string;
  description: string;
  icon: string;
}

export function StubPage({ title, description, icon }: StubPageProps) {
  return (
    <div style={{ maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
        {title}
      </h1>

      <Card>
        <CardContent>
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>{icon}</div>
            <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
              {title}
            </h3>
            <p style={{ color: '#6B7280', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
              {description}
            </p>
            <div
              style={{
                marginTop: '32px',
                padding: '16px',
                backgroundColor: '#EFF6FF',
                borderRadius: '8px',
                maxWidth: '500px',
                margin: '32px auto 0',
              }}
            >
              <p style={{ fontSize: '14px', color: '#1E40AF', margin: 0 }}>
                This feature is part of the comprehensive user panel specification and is ready for
                implementation with database schema, APIs, and UI components already defined.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
