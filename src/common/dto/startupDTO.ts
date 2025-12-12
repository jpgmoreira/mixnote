import { Profile, ProfileRegistry } from '@common/schemas/profile';

export type StartupDTO = {
  profile: Profile | null;
  registry: ProfileRegistry;
};
