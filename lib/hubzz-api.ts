import { z } from 'zod';
import {
  mockEvent,
  mockGroupMembers,
  mockStages,
  mockStreamQueue,
  mockTickets,
  mockStubs,
  mockGroupProfile,
  mockDropInSession,
  mockNotifications,
} from './mock-data';

const baseUrl = process.env.HUBZZ_API_URL || 'https://api.hubzz.local';
const apiKey = process.env.HUBZZ_API_KEY;

export const venueCoordinatesSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const hubzzStageSchema = z.object({
  id: z.string(),
  name: z.string(),
  venueModuleId: z.string(),
  zoneId: z.string(),
  streamType: z.enum(['spatial', 'external']),
  externalStreamUrl: z.string().url().optional().nullable(),
  deepLink: z.string(),
  venueCoordinates: venueCoordinatesSchema,
  priority: z.number().optional(),
});

export const hubzzEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  groupId: z.string(),
  zoneId: z.string(),
  venueCoordinates: venueCoordinatesSchema,
  ticketPrice: z.number(),
  recordingUrl: z.string().url().optional(),
});

export const groupMemberSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatarUrl: z.string().url().optional(),
  role: z.enum(['owner', 'admin', 'member']),
});

export const streamSchema = z.object({
  platform: z.enum(['kick', 'twitch', 'youtube']),
  channelId: z.string(),
  embedUrl: z.string().url(),
  priority: z.number(),
});

export const streamQueueSchema = z.object({
  eventId: z.string(),
  activeStreamIndex: z.number(),
  streams: z.array(streamSchema),
});

export const hubzzTicketSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  eventName: z.string(),
  venueName: z.string(),
  hostName: z.string(),
  zoneId: z.string(),
  venueModuleId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  canJoinAt: z.string().optional(),
  issuedAt: z.string(),
  ticketNumber: z.string(),
  status: z.enum(['upcoming', 'live', 'past', 'stub']),
  deepLink: z.string(),
  stubId: z.string().optional(),
  isCurrent: z.boolean().optional(),
});

const dropInParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().url().optional(),
  role: z.string().optional(),
  isHost: z.boolean().optional(),
  isMuted: z.boolean().optional(),
  isSpeaking: z.boolean().optional(),
});

export const dropInSessionSchema = z.object({
  id: z.string(),
  locationLabel: z.string().optional(),
  roomName: z.string().optional(),
  participants: z.array(dropInParticipantSchema),
});

export const notificationSchema = z.object({
  id: z.string(),
  type: z.enum(['event', 'friend-request', 'friend-accepted', 'system']),
  title: z.string(),
  message: z.string(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  createdAt: z.string(),
  avatarUrl: z.string().url().optional(),
});

const stubPersonSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().url().optional(),
  role: z.string().optional(),
});

const stubGuestSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().url().optional(),
  durationMinutes: z.number().optional(),
  attendeeNumber: z.number().optional(),
});

export const hubzzStubSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  ticketNumber: z.string(),
  eventName: z.string(),
  description: z.string(),
  venueName: z.string(),
  venueImageUrl: z.string().url().optional(),
  hostName: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  zoneId: z.string(),
  venueModuleId: z.string(),
  replayUrl: z.string().url().optional(),
  hostedBy: z.array(stubPersonSchema),
  guests: z.array(stubGuestSchema),
  guestCount: z.number(),
  stubCode: z.string(),
});

const groupEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  hostName: z.string(),
  status: z.enum(['upcoming', 'live', 'ended']),
  imageUrl: z.string().url().optional(),
  attendeeCount: z.number().optional(),
  capacity: z.number().optional(),
  isFree: z.boolean().optional(),
  rsvpLabel: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
});

const groupMerchSchema = z.object({
  id: z.string(),
  name: z.string(),
  subtitle: z.string().optional(),
  priceHbc: z.number(),
  stubCost: z.number().optional(),
  requiredStubs: z.number().optional(),
  ownedStubs: z.number().optional(),
  imageUrl: z.string().url().optional(),
  supplyLabel: z.string().optional(),
  unlockNote: z.string().optional(),
});

export const groupProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
  avatarUrl: z.string().url().optional(),
  followerLabel: z.string().optional(),
  isFollowed: z.boolean().optional(),
  stubCount: z.number().optional(),
  badgeLabel: z.string().optional(),
  events: z.array(groupEventSchema),
  merch: z.array(groupMerchSchema),
  members: z.array(groupMemberSchema),
});

export type HubzzEvent = z.infer<typeof hubzzEventSchema>;
export type HubzzStage = z.infer<typeof hubzzStageSchema>;
export type GroupMember = z.infer<typeof groupMemberSchema>;
export type StreamQueue = z.infer<typeof streamQueueSchema>;
export type HubzzTicket = z.infer<typeof hubzzTicketSchema>;
export type HubzzStub = z.infer<typeof hubzzStubSchema>;
export type HubzzGroupProfile = z.infer<typeof groupProfileSchema>;
export type DropInSession = z.infer<typeof dropInSessionSchema>;
export type HubzzNotification = z.infer<typeof notificationSchema>;

export class HubzzApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

async function fetchJson<T>(path: string, schema: z.ZodSchema<T>, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey && typeof window === 'undefined') {
    headers['x-hubzz-api-key'] = apiKey;
  }

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });

  if (!response.ok) {
    throw new HubzzApiError(`Hubzz API error ${response.status}`, response.status);
  }

  const data = await response.json();
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new HubzzApiError('Hubzz API response validation failed');
  }

  return parsed.data;
}

export async function getEvent(eventId: string, { useMock = false } = {}): Promise<HubzzEvent> {
  if (useMock) return hubzzEventSchema.parse(mockEvent);
  return fetchJson(`/events/${eventId}`, hubzzEventSchema);
}

export async function getEventStages(eventId: string, { useMock = false } = {}): Promise<HubzzStage[]> {
  if (useMock) return z.array(hubzzStageSchema).parse(mockStages);
  return fetchJson(`/events/${eventId}/stages`, z.array(hubzzStageSchema));
}

export async function getGroupMembers(groupId: string, { useMock = false } = {}): Promise<GroupMember[]> {
  if (useMock) return z.array(groupMemberSchema).parse(mockGroupMembers);
  return fetchJson(`/groups/${groupId}/members`, z.array(groupMemberSchema));
}

export async function getStreamQueue(eventId: string, { useMock = false } = {}): Promise<StreamQueue> {
  if (useMock) return streamQueueSchema.parse(mockStreamQueue);
  return fetchJson(`/events/${eventId}/stream-queue`, streamQueueSchema);
}

export async function getDropInSession(
  eventId: string,
  { useMock = false } = {},
): Promise<DropInSession> {
  if (useMock) return dropInSessionSchema.parse(mockDropInSession);
  return fetchJson(`/events/${eventId}/drop-in`, dropInSessionSchema);
}

export async function getUserTickets(
  userId: string,
  { useMock = false } = {}
): Promise<HubzzTicket[]> {
  if (useMock) return z.array(hubzzTicketSchema).parse(mockTickets);
  return fetchJson(`/users/${userId}/tickets`, z.array(hubzzTicketSchema));
}

export async function getStub(stubId: string, { useMock = false } = {}): Promise<HubzzStub> {
  if (useMock) {
    const stub = mockStubs.find((item) => item.id === stubId);
    if (!stub) throw new HubzzApiError('Stub not found', 404);
    return hubzzStubSchema.parse(stub);
  }
  return fetchJson(`/stubs/${stubId}`, hubzzStubSchema);
}

export async function getUserNotifications(
  userId: string,
  { useMock = false } = {},
): Promise<HubzzNotification[]> {
  if (useMock) return z.array(notificationSchema).parse(mockNotifications);
  return fetchJson(`/users/${userId}/notifications`, z.array(notificationSchema));
}

export async function getGroupProfile(
  groupId: string,
  { useMock = false } = {},
): Promise<HubzzGroupProfile> {
  if (useMock) {
    if (mockGroupProfile.id !== groupId) {
      throw new HubzzApiError('Group not found', 404);
    }
    return groupProfileSchema.parse(mockGroupProfile);
  }
  return fetchJson(`/groups/${groupId}`, groupProfileSchema);
}
