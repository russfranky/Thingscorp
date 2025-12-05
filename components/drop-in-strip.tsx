import { DropInSession } from '@/lib/hubzz-api';

interface Props {
  session: DropInSession;
}

export function DropInStrip({ session }: Props) {
  return (
    <section className="placeholder-box" style={{ display: 'grid', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700 }}>Drop-in audio / video</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.75 }}>
            {session.locationLabel || session.roomName || 'Backstage room'}
          </div>
        </div>
        <span className="badge">Live</span>
      </div>
      <div
        style={{
          display: 'grid',
          gap: '0.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        }}
      >
        {session.participants.map((person) => (
          <div
            key={person.id}
            className="card muted-border"
            style={{ padding: '0.75rem', display: 'grid', gap: '0.25rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600 }}>{person.name}</div>
              {person.isHost ? <span className="pill">Host</span> : null}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{person.role || 'Participant'}</div>
            <div style={{ fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}>
              <span className={person.isSpeaking ? 'accent' : 'muted'}>
                {person.isSpeaking ? 'Speaking' : 'Listening'}
              </span>
              <span className={person.isMuted ? 'muted' : 'accent'}>{person.isMuted ? 'Muted' : 'Live mic'}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
