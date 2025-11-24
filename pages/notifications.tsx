import { GetStaticProps } from 'next';
import { NotificationFeed } from '@/components/notification-feed';
import { getUserNotifications, HubzzNotification } from '@/lib/hubzz-api';
import { defaultUseMock } from '@/lib/mock-config';

interface Props {
  notifications: HubzzNotification[];
}

export default function NotificationsPage({ notifications }: Props) {
  return (
    <main style={{ padding: '2rem', maxWidth: 900, margin: '0 auto', display: 'grid', gap: '1rem' }}>
      <header>
        <p style={{ opacity: 0.75 }}>Hubzz preview</p>
        <h1>Notifications</h1>
        <p>Events from followed groups and social actions show here.</p>
      </header>
      <NotificationFeed notifications={notifications} />
    </main>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const useMock = defaultUseMock();
  const notifications = await getUserNotifications('user-1', { useMock });

  return {
    props: { notifications },
    revalidate: 30,
  };
};
