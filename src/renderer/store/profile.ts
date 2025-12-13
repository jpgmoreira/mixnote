import { AuthResponseDTO } from '@common/dto/authResponseDTO';
import { GenericResponseDTO } from '@common/dto/genericResponseDTO';
import { StartupDTO } from '@common/dto/startupDTO';
import { EventEmitter } from '@common/events/eventEmitter';
import { getEmptyProfileRegistry, Profile } from '@common/schemas/profile';
import { InvokeChannels } from '@preload/channels/invoke';
import { Events } from '@renderer/events';
import { defineStore } from 'pinia';

EventEmitter.instance.on(Events.loadStartupData, (data: StartupDTO) => {
  useProfileStore().initData(data);
});

EventEmitter.instance.on(Events.clearProfileData, () => {
  useProfileStore().clear();
});

export const useProfileStore = defineStore('profile', {
  state: () => ({
    currProfile: null as Profile | null,
    registry: getEmptyProfileRegistry(),
  }),
  actions: {
    initData(data: StartupDTO) {
      this.currProfile = data.profile;
      this.registry = data.registry;
    },
    clear() {
      this.currProfile = null;
      this.registry.currProfileId = null;
    },
    async createProfile(name: string): Promise<AuthResponseDTO> {
      const result = await window.api.invoke<AuthResponseDTO>(InvokeChannels.createProfile, name);
      if (result.status === 'success') {
        EventEmitter.instance.emit(Events.loadStartupData, result.data);
      }
      return result;
    },
    async login(profileId: string) {
      const result = await window.api.invoke<AuthResponseDTO>(InvokeChannels.login, profileId);
      if (result.status === 'success') {
        EventEmitter.instance.emit(Events.loadStartupData, result.data);
      }
      return result;
    },
    async deleteProfile(profileId: string): Promise<GenericResponseDTO> {
      const result = await window.api.invoke<GenericResponseDTO>(
        InvokeChannels.deleteProfile,
        profileId
      );
      if (result.status === 'success') {
        this.registry.profileRecords = this.registry.profileRecords.filter(
          (p) => p.id !== profileId
        );
      }
      return result;
    },
    async renameProfile(profileId: string, newName: string): Promise<GenericResponseDTO> {
      newName = newName.trim();
      const result = await window.api.invoke<GenericResponseDTO>(
        InvokeChannels.renameProfile,
        profileId,
        newName
      );
      if (result.status === 'success') {
        const record = this.registry.profileRecords.find((p) => p.id === profileId)!;
        record.name = newName;
      }
      return result;
    },
    async logout() {
      EventEmitter.instance.emit(Events.clearProfileData);
      const result = await window.api.invoke<AuthResponseDTO>(InvokeChannels.logout);
      if (result.status === 'success') {
        this.initData(result.data);
      }
    },
  },
});
