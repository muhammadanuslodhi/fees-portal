import { createContext, useContext, useEffect, useState } from 'react';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [username, setUsername] = useState(() => localStorage.getItem('username'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));

  useEffect(() => {
    if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');
    if (username) localStorage.setItem('username', username); else localStorage.removeItem('username');
    if (role) localStorage.setItem('role', role); else localStorage.removeItem('role');
  }, [token, username, role]);

  const login = (t, u, r) => { setToken(t); setUsername(u); setRole(r); };
  const logout = () => { setToken(null); setUsername(null); setRole(null); };

  return <AuthCtx.Provider value={{ token, username, role, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

