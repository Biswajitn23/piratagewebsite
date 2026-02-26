import { CreateUserProfileData, CreateUserProfileVariables } from '../';
import { UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUserProfile(options?: useDataConnectMutationOptions<CreateUserProfileData, FirebaseError, CreateUserProfileVariables>): UseDataConnectMutationResult<CreateUserProfileData, CreateUserProfileVariables>;
export function useCreateUserProfile(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserProfileData, FirebaseError, CreateUserProfileVariables>): UseDataConnectMutationResult<CreateUserProfileData, CreateUserProfileVariables>;
