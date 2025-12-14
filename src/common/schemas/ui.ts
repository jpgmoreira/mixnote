export type UISettings = {
  explorerWidth: number;
  explorerScrollTop: number;
};

export function getEmptyUISettings(): UISettings {
  return {
    explorerWidth: 300,
    explorerScrollTop: 0,
  };
}
