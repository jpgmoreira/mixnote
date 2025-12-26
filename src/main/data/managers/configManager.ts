import { FileProxy } from '../fileProxy';
import path from 'path';
import { DATA_DIR } from '@main/constants';
import { ProfileConfig, getEmptyProfileConfig } from '@common/schemas/config';
import { YesNo } from '@common/types/yesNo';

/**
 * Singleton for managing profile configuration.
 * Access via ConfigManager.instance
 */
export class ConfigManager {
  static #instance: ConfigManager;

  private _proxy: FileProxy<ProfileConfig> | null = null;

  private get proxy() {
    return this._proxy?.proxy || null;
  }

  private get target() {
    return this._proxy?.target || null;
  }

  private constructor() {}

  public static get instance(): ConfigManager {
    if (!this.#instance) {
      this.#instance = new ConfigManager();
    }
    return this.#instance;
  }

  public loadProfile(profileId: string) {
    const fPath = path.join(DATA_DIR, 'profileData', profileId, 'config.json');
    this._proxy = new FileProxy(fPath, getEmptyProfileConfig());
  }

  public getProfileConfig() {
    if (!this.target) throw new Error('Profile config not initialized!');
    return structuredClone(this.target);
  }

  public setReviewBucket(value: YesNo[]) {
    if (!this.proxy) throw new Error('Profile config not initialized!');
    this.proxy.reviewBucket = value;
  }

  public clear() {
    this._proxy = null;
  }
}
