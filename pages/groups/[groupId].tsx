import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { HubzzGroupProfile, getGroupProfile } from '@/lib/hubzz-api';
import { defaultUseMock } from '@/lib/mock-config';

type TabKey = 'events' | 'merch' | 'members';

interface Props {
  profile: HubzzGroupProfile;
}

function formatDateRange(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return {
    dateLabel: dateFormatter.format(start),
    timeRange: `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`,
  };
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={`group-tab ${active ? 'is-active' : ''}`} onClick={onClick} type="button">
      {label}
    </button>
  );
}

export default function GroupDetailPage({ profile }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('events');

  const merchStubOwned = profile.stubCount ?? 0;

  return (
    <>
      <Head>
        <title>{profile.name} | Hubzz Mock Group</title>
      </Head>
      <main className="group-page">
        <section className="group-hero" style={{ backgroundImage: profile.coverImageUrl ? `url(${profile.coverImageUrl})` : undefined }}>
          <div className="group-hero-overlay">
            <div className="group-hero-header">
              <div className="group-avatar" aria-hidden>
                {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : <span>{profile.name[0]}</span>}
              </div>
              <div className="group-hero-text">
                <div className="group-badge-row">
                  {profile.badgeLabel && <span className="group-badge">{profile.badgeLabel}</span>}
                  {profile.category && <span className="group-chip">{profile.category}</span>}
                </div>
                <h1 className="group-title">{profile.name}</h1>
                <p className="group-description">{profile.description}</p>
                <div className="group-meta-row">
                  <div className="group-avatars" aria-label="Hosts and moderators">
                    {profile.members.slice(0, 5).map((member) => (
                      <div key={member.id} className="group-avatar-circle" title={member.username} aria-hidden />
                    ))}
                    {profile.members.length > 5 && <div className="group-avatar-circle muted">+{profile.members.length - 5}</div>}
                  </div>
                  <span className="group-follow-state">{profile.followerLabel ?? 'Follow'}</span>
                  <span className="group-stub-count">Stubs owned: {profile.stubCount ?? 0}</span>
                </div>
              </div>
              <div className="group-hero-actions">
                <button className="group-follow-btn" type="button">
                  {profile.isFollowed ? 'Followed' : 'Follow'}
                </button>
              </div>
            </div>
            <div className="group-tabs" role="tablist">
              <TabButton label="Events" active={activeTab === 'events'} onClick={() => setActiveTab('events')} />
              <TabButton label="Merch" active={activeTab === 'merch'} onClick={() => setActiveTab('merch')} />
              <TabButton label="Members" active={activeTab === 'members'} onClick={() => setActiveTab('members')} />
            </div>
          </div>
        </section>

        {activeTab === 'events' && (
          <section className="group-section" aria-label="Upcoming events">
            <div className="group-section-header">
              <h2>Upcoming events</h2>
              <a className="group-link" href="#">
                View past events
              </a>
            </div>
            <div className="group-card-grid">
              {profile.events.map((event) => {
                const { dateLabel, timeRange } = formatDateRange(event.startTime, event.endTime);
                return (
                  <article key={event.id} className="group-event-card">
                    {event.imageUrl && <img src={event.imageUrl} alt="" className="group-event-image" />}
                    <div className="group-event-body">
                      <div className="group-event-date">{dateLabel}</div>
                      <h3 className="group-event-title">{event.name}</h3>
                      <div className="group-event-meta">Hosted by {event.hostName}</div>
                      <div className="group-event-meta">{timeRange}</div>
                      <div className="group-event-meta">{event.attendeeCount ?? 0}+ RSVPs</div>
                    </div>
                    <div className="group-event-footer">
                      <div className="group-event-capacity">{event.isFree ? 'Free' : 'Ticketed'}</div>
                      <button
                        type="button"
                        className="group-primary-btn"
                        onClick={() => {
                          if (event.ctaHref) window.location.href = event.ctaHref;
                        }}
                      >
                        {event.ctaLabel ?? event.rsvpLabel ?? 'Open'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'merch' && (
          <section className="group-section" aria-label="Stub-gated merch">
            <div className="group-section-header">
              <div>
                <h2>Available items</h2>
                <p className="group-note">Stubs Owned: {merchStubOwned}</p>
              </div>
            </div>
            <div className="group-card-grid">
              {profile.merch.map((item) => (
                <article key={item.id} className="group-merch-card">
                  {item.imageUrl && <img src={item.imageUrl} alt="" className="group-merch-image" />}
                  <div className="group-merch-body">
                    <div className="group-merch-title-row">
                      <h3 className="group-merch-title">{item.name}</h3>
                      {item.subtitle && <span className="group-merch-subtitle">{item.subtitle}</span>}
                    </div>
                    <div className="group-merch-price">
                      <span>{item.priceHbc.toLocaleString()} HBC</span>
                      {typeof item.stubCost === 'number' && <span className="group-chip">{item.stubCost} stubs</span>}
                    </div>
                    <p className="group-note">Requires {item.requiredStubs ?? 0}+ stubs</p>
                    {item.unlockNote && <p className="group-note">{item.unlockNote}</p>}
                  </div>
                  <div className="group-merch-footer">
                    <button className="group-secondary-btn" type="button">
                      Claim / Purchase
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'members' && (
          <section className="group-section" aria-label="Group members">
            <div className="group-section-header">
              <h2>Members ({profile.members.length})</h2>
              <p className="group-note">Members have host/mod privileges during events.</p>
            </div>
            <ul className="group-members-list">
              {profile.members.map((member) => (
                <li key={member.id} className="group-member-row">
                  <div className="group-avatar-circle" aria-hidden />
                  <div className="group-member-meta">
                    <div className="group-member-name">{member.username}</div>
                    <div className="group-member-role">{member.role === 'member' ? 'Member' : member.role === 'owner' ? 'Host' : 'Moderator'}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="group-member-cta">
              <button className="group-primary-btn" type="button">
                Request to join
              </button>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const groupId = params?.groupId as string;
  const useMock = defaultUseMock();
  const profile = await getGroupProfile(groupId ?? 'group-1', { useMock });

  return {
    props: { profile },
  };
};
