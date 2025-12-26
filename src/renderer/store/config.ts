import { defineStore } from 'pinia';
import { EventEmitter } from '@common/events/eventEmitter';
import { Events } from '@renderer/events';
import { StartupDTO } from '@common/dto/startupDTO';
import { getEmptyAppConfig } from '@common/schemas/config';
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
    config: getEmptyAppConfig(),
  }),
  actions: {
    initData(data: StartupDTO) {
      if (data.config) this.config = data.config;
    },
    async toggleConfigReviewBucket(value: YesNo) {
      let newArray = [...this.config.reviewBucket];
      if (newArray.includes(value)) arrayRemove(newArray, value);
      else newArray.push(value);
      if (!newArray.length) return;
      this.config.reviewBucket = newArray;
      await window.api.invoke(InvokeChannels.setConfigReviewBucket, newArray);
    },
    clear() {
      this.config = getEmptyAppConfig();
    },
  },
});
