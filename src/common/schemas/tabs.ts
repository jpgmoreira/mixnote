export type TabGroup = {
  id: string;
  width: number; // percentage, 0 - 1.
  active: boolean;
  tabs: any[];
};

export function getEmptyTabGroup(id: string) {
  return {
    id,
    width: 1,
    active: false,
    tabs: [],
  };
}
