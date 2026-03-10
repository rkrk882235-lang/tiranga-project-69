interface TimelineItem {
  id: string;
  status: string;
  timestamp: string;
  location?: string;
  notes?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div style={{ position: 'relative', paddingLeft: '32px' }}>
      {items.map((item, index) => (
        <TimelineEvent
          key={item.id}
          item={item}
          isLast={index === items.length - 1}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
}

interface TimelineEventProps {
  item: TimelineItem;
  isLast: boolean;
  isFirst: boolean;
}

function TimelineEvent({ item, isLast, isFirst }: TimelineEventProps) {
  return (
    <div style={{ position: 'relative', paddingBottom: isLast ? 0 : '24px' }}>
      <div
        style={{
          position: 'absolute',
          left: '-32px',
          top: 0,
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: isFirst ? '#2563EB' : '#9CA3AF',
          border: '2px solid #fff',
          boxShadow: '0 0 0 2px #E5E7EB',
        }}
      />
      {!isLast && (
        <div
          style={{
            position: 'absolute',
            left: '-26px',
            top: '12px',
            width: '2px',
            height: 'calc(100% + 12px)',
            backgroundColor: '#E5E7EB',
          }}
        />
      )}
      <div>
        <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
          {item.status}
        </div>
        <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '2px' }}>
          {new Date(item.timestamp).toLocaleString()}
        </div>
        {item.location && (
          <div style={{ fontSize: '14px', color: '#6B7280' }}>
            {item.location}
          </div>
        )}
        {item.notes && (
          <div style={{ fontSize: '14px', color: '#374151', marginTop: '4px' }}>
            {item.notes}
          </div>
        )}
      </div>
    </div>
  );
}
