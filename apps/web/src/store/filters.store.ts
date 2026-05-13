import { create } from 'zustand';
import type { VenueFilters } from '@/types';

interface FiltersState {
  filters: VenueFilters;
  setFilter: <K extends keyof VenueFilters>(key: K, value: VenueFilters[K]) => void;
  setFilters: (filters: VenueFilters) => void;
  reset: () => void;
}

const initial: VenueFilters = {};

export const useFiltersStore = create<FiltersState>((set) => ({
  filters: initial,
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  setFilters: (filters) => set({ filters }),
  reset: () => set({ filters: initial }),
}));
