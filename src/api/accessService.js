import { api } from './apiClient';

export const accessService = {
  list(params = {}) { return api.get('listRecords', { type: 'ACCESS', ...params }); },
  get(id) { return api.get('getRecord', { id }); },
  create(fields) { return api.post('createAccess', { fields }); },
  updateStatus(id, newStatus, reason) { return api.post('updateAccessStatus', { id, newStatus, reason }); },
  softDelete(id) { return api.post('softDeleteRecord', { id }); }
};
