import { defineStore } from 'pinia';
import { EventEmitter } from '@common/events/eventEmitter';
import { Events } from '@renderer/events';
import { StartupDTO } from '@common/dto/startupDTO';
import { getEmptyProfileConfig } from '@common/schemas/config';
import { InvokeChannels } from '@preload/channels/invoke';
import { YesNo } from '@common/types/yesNo';
import { arrayRemove } from '@common/utils/utils';

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
    toggleConfigReviewBucket(value: YesNo) {
      let newArray = [...this.config.reviewBucket];
      if (newArray.includes(value)) arrayRemove(newArray, value);
      else newArray.push(value);
      if (!newArray.length) return;
      this.config.reviewBucket = newArray;
      window.api.invoke(InvokeChannels.setConfigReviewBucket, newArray);
    },
    clear() {
      this.config = getEmptyProfileConfig();
    },
  },
});
