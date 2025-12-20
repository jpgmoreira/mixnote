export type Tab = {
  id: string;
  preview: boolean;
  noteId: string;
};

export type TabGroup = {
  id: string;
  width: number; // percentage, 0 - 1.
  active: boolean;
  activeTab: string | null;
  tabs: Tab[];
};

export function getEmptyTabGroup(id: string): TabGroup {
  return {
    id,
    width: 1,
    active: false,
    activeTab: null,
    tabs: [],
  };
}
