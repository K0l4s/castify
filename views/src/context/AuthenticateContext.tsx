import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { login, logout, setUser } from '../redux/slice/authSlice';
import { userService } from '../services/UserService';
import { User } from '../models/User';

interface AuthContextType {
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();

  const checkAuth = async () => {
    const token = Cookies.get('token');
    
    if (token) {
      try {
        const userRes = await userService.getUser(token);
        const user: User = userRes.data;
        
        dispatch(login());
        dispatch(setUser(user));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication check failed:', error);
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        dispatch(logout());
        setIsAuthenticated(false);
      }
    } else {
      dispatch(logout());
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
