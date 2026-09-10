import { api } from './apiClient';

export const configService = {
  get() { return api.get('getConfig'); },
  addValue(configKey, configValue) { return api.post('adminAddConfigValue', { configKey, configValue }); }
};
