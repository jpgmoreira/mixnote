import { FileProxy } from '../fileProxy';
import path from 'path';
import { DATA_DIR } from '@main/constants';
import { getEmptyUISettings, UISettings } from '@common/schemas/ui';

/**
 * Singleton for managing UI settings.
 * Access via UIManager.instance
 */
export class UIManager {
  static #instance: UIManager;

  private _proxy: FileProxy<UISettings> | null = null;

  private get proxy() {
    return this._proxy?.proxy || null;
  }

  private get target() {
    return this._proxy?.target || null;
  }
  private constructor() {}

  public static get instance(): UIManager {
    if (!this.#instance) {
      this.#instance = new UIManager();
    }
    return this.#instance;
  }

  public loadProfile(profileId: string) {
    const fPath = path.join(DATA_DIR, 'profileData', profileId, 'ui.json');
    this._proxy = new FileProxy(fPath, getEmptyUISettings());
  }

  public getUISettings() {
    if (!this.target) throw new Error('UI settings not initialized!');
    return structuredClone(this.target);
  }

  public setUISettings(settings: UISettings) {
    if (!this.proxy) throw new Error('UI settings not initialized!');
    Object.assign(this.proxy, settings);
  }

  public clear() {
    this._proxy = null;
  }
}
