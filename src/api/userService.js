import { api } from './apiClient';

export const userService = {
  list() { return api.get('listUsers'); },
  listDevOps() { return api.get('listDevOpsUsers'); },
  updateProfile(fields) { return api.post('updateProfile', fields); },
  approve(id, role, power) { return api.post('adminApproveUser', { id, role, power }); },
  reject(id, reason) { return api.post('adminRejectUser', { id, reason }); },
  update(id, role, power) { return api.post('adminUpdateUser', { id, role, power }); },
  setActive(id, active) { return api.post('adminDeactivateUser', { id, active }); }
};
