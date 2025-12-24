import { FileProxy } from '../fileProxy';
import path from 'path';
import { DATA_DIR } from '@main/constants';
import { getEmptyTabGroup, TabGroup } from '@common/schemas/tabs';
import { randomId, toRawDeep } from '@common/utils/utils';

type TabsManagerProxy = {
  groups: TabGroup[];
};

/**
 * Singleton for managing tabs.
 * Access via TabsManager.instance
 */
export class TabsManager {
  static #instance: TabsManager;

  private _proxy: FileProxy<TabsManagerProxy> | null = null;

  private get proxy() {
    return this._proxy?.proxy || null;
  }

  private get target() {
    return this._proxy?.target || null;
  }

  private constructor() {}

  public static get instance(): TabsManager {
    if (!this.#instance) {
      this.#instance = new TabsManager();
    }
    return this.#instance;
  }

  public loadProfile(profileId: string) {
    const fPath = path.join(DATA_DIR, 'profileData', profileId, 'tabs.json');
    const id = randomId();
    const group = getEmptyTabGroup(id);
    this._proxy = new FileProxy(fPath, { groups: [group] });
  }

  public getGroups(): TabGroup[] {
    if (!this.target) throw new Error('Cannot get tab groups before initialization!');
    return structuredClone(toRawDeep(this.target.groups));
  }

  public updateGroups(groups: TabGroup[]) {
    if (!this.proxy) throw new Error('Proxy not initialized');
    this.proxy.groups = groups;
  }

  public noteDeleted(noteId: string) {
    if (!this.proxy) throw new Error('Proxy not initialized');
    for (const group of this.proxy.groups) {
      group.tabs = group.tabs.filter((t) => t.noteId !== noteId);
    }
  }

  public clear() {
    this._proxy = null;
  }
}
