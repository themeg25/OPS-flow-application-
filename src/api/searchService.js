import { api } from './apiClient';

export const searchService = {
  search(q) { return api.get('search', { q }); }
};
