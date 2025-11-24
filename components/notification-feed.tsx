import { HubzzNotification } from '@/lib/hubzz-api';

interface Props {
  notifications: HubzzNotification[];
}

export function NotificationFeed({ notifications }: Props) {
  if (!notifications.length) {
    return <p className="muted">No notifications yet.</p>;
  }

  return (
    <div className="card" style={{ display: 'grid', gap: '0.75rem', padding: '1rem' }}>
      {notifications.map((item) => (
        <article key={item.id} className="muted-border" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #202537' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{item.title}</div>
              <div style={{ opacity: 0.8 }}>{item.message}</div>
            </div>
            <span className="pill" style={{ textTransform: 'capitalize' }}>
              {item.type.replace('-', ' ')}
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: '0.25rem' }}>
            {new Date(item.createdAt).toLocaleString()}
          </div>
          {item.ctaHref && item.ctaLabel ? (
            <a className="link" href={item.ctaHref} style={{ display: 'inline-flex', marginTop: '0.35rem' }}>
              {item.ctaLabel}
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}
