import { ConnectorConfig, DataConnect, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateUserProfileData {
  user_insert: User_Key;
}

export interface CreateUserProfileVariables {
  displayName: string;
  email: string;
}

export interface Event_Key {
  id: UUIDString;
  __typename?: 'Event_Key';
}

export interface ForumPost_Key {
  id: UUIDString;
  __typename?: 'ForumPost_Key';
}

export interface Interest_Key {
  id: UUIDString;
  __typename?: 'Interest_Key';
}

export interface RSVP_Key {
  userId: UUIDString;
  eventId: UUIDString;
  __typename?: 'RSVP_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserProfileVariables): MutationRef<CreateUserProfileData, CreateUserProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserProfileVariables): MutationRef<CreateUserProfileData, CreateUserProfileVariables>;
  operationName: string;
}
export const createUserProfileRef: CreateUserProfileRef;

export function createUserProfile(vars: CreateUserProfileVariables): MutationPromise<CreateUserProfileData, CreateUserProfileVariables>;
export function createUserProfile(dc: DataConnect, vars: CreateUserProfileVariables): MutationPromise<CreateUserProfileData, CreateUserProfileVariables>;

