import { Profile, ProfileRegistry } from '@common/schemas/profile';
import { AppConfig } from '@common/schemas/config';
import { TabGroup } from '@common/schemas/tabs';
import { UISettings } from '@common/schemas/ui';
import { GraphRecord } from '@common/schemas/graph';

export type StartupDTO = {
  profile: Profile | null;
  registry: ProfileRegistry;
  ui: UISettings | null;
  tabGroups: TabGroup[] | null;
  config: AppConfig | null;
  graphData: GraphRecord[];
};
