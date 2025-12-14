import { defineStore } from 'pinia';
import { EventEmitter } from '@common/events/eventEmitter';
import { Events } from '@renderer/events';
import { StartupDTO } from '@common/dto/startupDTO';
import { getEmptyUISettings, UISettings } from '@common/schemas/ui';
import { InvokeChannels } from '@preload/channels/invoke';
import { toRaw } from 'vue';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

EventEmitter.instance.on(Events.loadStartupData, (data: StartupDTO) => {
  useUIStore().initData(data);
});

EventEmitter.instance.on(Events.clearProfileData, () => {
  useUIStore().clear();
});

export const useUIStore = defineStore('ui', {
  state: () => ({
    toast: {
      visible: false,
      message: '',
      type: 'success',
      timer: null,
    },
    backdropVisible: false,
    settings: getEmptyUISettings(),
    settingsUpdateTimer: undefined as ReturnType<typeof setTimeout> | undefined,
  }),
  actions: {
    initData(data: StartupDTO) {
      if (data.ui) {
        this.settings = data.ui;
      }
    },
    updateSettings(settings: Partial<UISettings>) {
      clearTimeout(this.settingsUpdateTimer);
      this.settingsUpdateTimer = setTimeout(() => {
        Object.assign(this.settings, settings);
        window.api.invoke(InvokeChannels.updateUISettings, toRaw(this.settings));
      }, 500);
    },
    showToast(message: string, type: ToastType, duration: number = 2000) {
      if (this.toast.visible) return;
      this.toast.message = message;
      this.toast.type = type;
      this.toast.visible = true;
      setTimeout(() => {
        this.toast.visible = false;
      }, duration);
    },
    clear() {
      this.settings = getEmptyUISettings();
    },
  },
});
