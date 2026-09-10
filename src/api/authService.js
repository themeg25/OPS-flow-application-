import { api, setToken } from './apiClient';

export const authService = {
  async register(name, email, password, mobile, role) {
    return api.post('register', { name, email, password, mobile, role });
  },
  async login(identifier, password) {
    const data = await api.post('login', { identifier, password });
    setToken(data.token);
    return data.user;
  },
  logout() {
    setToken(null);
  },
  async requestPasswordReset(email) {
    return api.post('requestPasswordReset', { email });
  },
  async resetPassword(email, otp, newPassword) {
    return api.post('resetPassword', { email, otp, newPassword });
  },
  async bootstrap() {
    return api.get('bootstrap');
  }
};
