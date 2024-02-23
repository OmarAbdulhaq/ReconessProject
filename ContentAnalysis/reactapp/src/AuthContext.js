import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const accessToken = localStorage.getItem('accessToken');
        const username = localStorage.getItem('username'); 
        return accessToken ? { username, accessToken } : null;
    });

    const updateUsername = (newUsername) => {
      if (user) {
          localStorage.setItem('username', newUsername);
          setUser({ ...user, username: newUsername });
      }
  };

    const login = (username, accessToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('username', username);
        setUser({ username, accessToken });
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username'); 
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUsername }}>
            {children}
        </AuthContext.Provider>
    );
};
