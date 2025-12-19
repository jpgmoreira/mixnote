import { Profile, ProfileRegistry } from '@common/schemas/profile';
import { TabGroup } from '@common/schemas/tabs';
import { UISettings } from '@common/schemas/ui';

export type StartupDTO = {
  profile: Profile | null;
  registry: ProfileRegistry;
  ui: UISettings | null;
  tabGroups: TabGroup[] | null;
};
