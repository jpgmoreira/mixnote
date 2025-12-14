import { Profile, ProfileRegistry } from '@common/schemas/profile';
import { UISettings } from '@common/schemas/ui';

export type StartupDTO = {
  profile: Profile | null;
  registry: ProfileRegistry;
  ui: UISettings | null;
};
