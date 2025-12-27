import { GraphRecord } from '@common/schemas/graph';
import { defineStore } from 'pinia';
import { EventEmitter } from '@common/events/eventEmitter';
import { Events } from '@renderer/events';
import { StartupDTO } from '@common/dto/startupDTO';

/**
 * I need to use this pinia store for the graph because the graph page is not initialized
 * when the application starts, so it cannot react to events.
 */

EventEmitter.instance.on(Events.loadStartupData, (data: StartupDTO) => {
  useGraphStore().initData(data);
});

EventEmitter.instance.on(Events.clearProfileData, () => {
  useGraphStore().clear();
});

export const useGraphStore = defineStore('graph', {
  state: () => ({
    records: [] as GraphRecord[],
  }),
  actions: {
    initData(data: StartupDTO) {
      this.records = data.graphData;
    },
    updateRecord(record: GraphRecord) {
      if (!this.records.length) {
        this.records.push(record);
        return;
      }
      const last = this.records.at(-1)!;
      if (record.date === last.date) {
        last.minutesStudied = record.minutesStudied;
        return;
      }
      this.records.push(record);
    },
    clear() {
      this.records = [];
    },
  },
});
