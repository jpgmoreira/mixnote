import { CreateProfileResponseDTO } from '@common/dto/createProfileResponseDTO';
import { GenericResponseDTO } from '@common/dto/genericResponseDTO';
import { StartupDTO } from '@common/dto/startupDTO';
import { EventEmitter } from '@common/events/eventEmitter';
import { getEmptyProfileRegistry, Profile } from '@common/schemas/profile';
import { Events } from '@renderer/events';
import { defineStore } from 'pinia';

EventEmitter.instance.on(Events.startup, (data: StartupDTO) => {
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
    async createProfile(name: string): Promise<CreateProfileResponseDTO> {},
    async login(profileId: string) {},
    async deleteProfile(profileId: string): Promise<GenericResponseDTO> {},
    async renameProfile(profileId: string, newName: string): Promise<GenericResponseDTO> {},
  },
});
