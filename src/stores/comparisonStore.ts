import { create } from 'zustand';

export interface Project {
  id: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  fullDescription: string;
  status: string;
  img: string;
  gallery: string[];
  pdf?: boolean;
}

interface ComparisonState {
  compareList: Project[];
  isOpen: boolean;
  addToCompare: (project: Project) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  compareList: [],
  isOpen: false,
  addToCompare: (project) =>
    set((state) => {
      // Check if already in list
      if (state.compareList.some((p) => p.id === project.id)) {
        return state;
      }
      // Max 3 properties allowed
      if (state.compareList.length >= 3) {
        return state;
      }
      return { compareList: [...state.compareList, project] };
    }),
  removeFromCompare: (id) =>
    set((state) => ({
      compareList: state.compareList.filter((p) => p.id !== id),
    })),
  clearCompare: () => set({ compareList: [] }),
  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));
