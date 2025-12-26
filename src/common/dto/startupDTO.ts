import { Profile, ProfileRegistry } from '@common/schemas/profile';
import { Settings } from '@common/schemas/settings';
import { TabGroup } from '@common/schemas/tabs';
import { UISettings } from '@common/schemas/ui';

export type StartupDTO = {
  profile: Profile | null;
  registry: ProfileRegistry;
  ui: UISettings | null;
  tabGroups: TabGroup[] | null;
  settings: Settings | null;
};
