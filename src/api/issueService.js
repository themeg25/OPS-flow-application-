import { api } from './apiClient';

export const issueService = {
  list(params = {}) { return api.get('listRecords', { type: 'ISSUE', ...params }); },
  get(id) { return api.get('getRecord', { id }); },
  create(fields) { return api.post('createIssue', { fields }); },
  update(id, fields, newStatus) { return api.post('updateIssue', { id, fields, newStatus }); },
  softDelete(id) { return api.post('softDeleteRecord', { id }); }
};

export const productionIssueService = {
  list(params = {}) { return api.get('listRecords', { type: 'PRODUCTION_ISSUE', ...params }); },
  get(id) { return api.get('getRecord', { id }); },
  create(fields) { return api.post('createProductionIssue', { fields }); },
  update(id, fields, newStatus) { return api.post('updateProductionIssue', { id, fields, newStatus }); },
  reopen(id, reason) { return api.post('reopenProductionIssue', { id, reason }); },
  softDelete(id) { return api.post('softDeleteRecord', { id }); }
};
