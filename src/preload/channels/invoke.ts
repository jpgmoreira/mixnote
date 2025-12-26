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
  getNote = 'get-note',
  updateNoteField = 'update-note-field',
  updateNote = 'update-note',
  renameNote = 'rename-note',
  getTabGroups = 'get-tab-groups',
  flashcardsFilter = 'flashcards-filter',
  getNextFlashcard = 'get-next-flashcard',
  setNoteFrequency = 'set-note-frequency',
  deleteNote = 'delete-note',
  setNoteInReviewBucket = 'set-note-in-review-bucket',
  setConfigReviewBucket = 'set-config-review-bucket',
}
