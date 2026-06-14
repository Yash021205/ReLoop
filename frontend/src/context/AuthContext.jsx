import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for a logged in user
    const storedUser = localStorage.getItem('reloop_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('reloop_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock authentication for demo purposes
    if (email === 'admin@reloop.com' && password === 'admin') {
      const adminUser = { id: 'admin1', email, name: 'Re:Loop Admin', role: 'admin' };
      localStorage.setItem('reloop_user', JSON.stringify(adminUser));
      setUser(adminUser);
      return adminUser;
    } else if (email === 'customer@reloop.com' && password === 'customer') {
      const customerUser = { id: 'u1', email, name: 'Re:Loop Customer', role: 'customer' };
      localStorage.setItem('reloop_user', JSON.stringify(customerUser));
      setUser(customerUser);
      return customerUser;
    }
    throw new Error('Invalid email or password');
  };

  const signup = async (email, password, name) => {
    // Mock signup (defaults to customer)
    const newUser = { id: `u_${Date.now()}`, email, name, role: 'customer' };
    localStorage.setItem('reloop_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('reloop_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
