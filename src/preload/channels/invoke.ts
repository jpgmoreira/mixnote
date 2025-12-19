/**
 * InvokeChannels are used for all communication from the renderer
 *   process to the main process, even if no response is expected.
 */

export enum InvokeChannels {
  createProfile = 'create-profile',
  renameProfile = 'rename-profile',
  deleteProfile = 'delete-profile',
  login = 'login',
  logout = 'logout',
  updateUISettings = 'update-ui-settings',
  updateTabGroups = 'update-tab-groups',
}
