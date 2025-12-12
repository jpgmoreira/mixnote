import { StartupDTO } from '@common/dto/startupDTO';
import { OnChannels } from '@preload/channels/on';
import { APP_NAME } from '@common/constants';
import { router } from '@renderer/router';

window.api.on(OnChannels.startup, async (data: StartupDTO) => {
  document.documentElement.classList.add('theme-dark');
  const title = data.profile ? `${data.profile.name}@${APP_NAME}` : APP_NAME;
  const route = data.profile ? '/notes' : '/login';
  document.title = title;
  await router.replace(route);
});
