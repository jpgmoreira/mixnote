import { defineStore } from 'pinia';
import { EventEmitter } from '@common/events/eventEmitter';
import { Events } from '@renderer/events';
import { StartupDTO } from '@common/dto/startupDTO';
import { getEmptyProfileConfig } from '@common/schemas/config';
import { InvokeChannels } from '@preload/channels/invoke';

EventEmitter.instance.on(Events.loadStartupData, (data: StartupDTO) => {
  useConfigStore().initData(data);
});

EventEmitter.instance.on(Events.clearProfileData, () => {
  useConfigStore().clear();
});

export const useConfigStore = defineStore('config', {
  state: () => ({
    config: getEmptyProfileConfig(),
  }),
  actions: {
    initData(data: StartupDTO) {
      if (data.config) this.config = data.config;
    },
    setReviewBucket() {
      window.api.invoke(InvokeChannels.setConfigReviewBucket, this.config.reviewBucket);
    },
    clear() {
      this.config = getEmptyProfileConfig();
    },
  },
});
