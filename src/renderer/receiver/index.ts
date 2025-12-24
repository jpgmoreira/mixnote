import { StartupDTO } from '@common/dto/startupDTO';
import { OnChannels } from '@preload/channels/on';
import { APP_NAME } from '@common/constants';
import { router } from '@renderer/router';
import { EventEmitter } from '@common/events/eventEmitter';
import { Events } from '@renderer/events';
import { initStores } from '@renderer/store/initStores';

window.api.on(OnChannels.startup, (data: StartupDTO) => {
  initStores();
  EventEmitter.instance.emit(Events.loadStartupData, data);
  document.documentElement.classList.add('theme-dark');
  const title = data.profile ? `${data.profile.name}@${APP_NAME}` : APP_NAME;
  document.title = title;
  if (data.profile) {
    router.replace({
      name: 'notes',
      params: { view: 'notes' },
    });
  } else {
    router.replace('/login');
  }
});
