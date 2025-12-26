import { FileProxy } from '../fileProxy';
import path from 'path';
import { DATA_DIR } from '@main/constants';
import { Settings, getEmptySettings } from '@common/schemas/settings';

/**
 * Singleton for managing profile settings.
 * Access via SettingsManager.instance
 */
export class SettingsManager {
  static #instance: SettingsManager;

  private _proxy: FileProxy<Settings> | null = null;

  private get proxy() {
    return this._proxy?.proxy || null;
  }

  private get target() {
    return this._proxy?.target || null;
  }

  private constructor() {}

  public static get instance(): SettingsManager {
    if (!this.#instance) {
      this.#instance = new SettingsManager();
    }
    return this.#instance;
  }

  public loadProfile(profileId: string) {
    const fPath = path.join(DATA_DIR, 'profileData', profileId, 'settings.json');
    this._proxy = new FileProxy(fPath, getEmptySettings());
  }

  public getSettings() {
    if (!this.target) throw new Error('Settings not initialized!');
    return structuredClone(this.target);
  }

  public clear() {
    this._proxy = null;
  }
}
