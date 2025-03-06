export const AuthService = {
    getToken: () => {
      return localStorage.getItem('token');
    },
    setToken: (token) => {
      localStorage.setItem('token', token);
    },
    removeToken: () => {
      localStorage.removeItem('token');
    },
    isAuthenticated: () => {
      return !!localStorage.getItem('token') ;
    }
  };