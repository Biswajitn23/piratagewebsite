/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Events API shared types
export type EventStatus = "upcoming" | "ongoing" | "past";

export interface EventSpeakerDTO {
  name: string;
  role: string;
  avatar: string;
}

export interface EventRecordDTO {
  id: string; // slug or uuid
  title: string;
  date: string; // ISO string
  type: string;
  status: EventStatus;
  coverImage: string;
  gallery: string[];
  description: string;
  speakers: EventSpeakerDTO[];
  registrationLink: string;
  slug: string;
  highlightScene?: string;
}

export interface ListEventsResponse {
  events: EventRecordDTO[];
}

export interface CreateEventRequest extends Omit<EventRecordDTO, "id"> {
  id?: string; // optional, server may assign from slug or uuid
}

export interface CreateEventResponse {
  event: EventRecordDTO;
}
