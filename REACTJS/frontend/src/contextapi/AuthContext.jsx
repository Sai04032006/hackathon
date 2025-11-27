import { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// Provider component to manage login states and user data
export function AuthProvider({ children }) 
{
  // Load initial state from localStorage or default to false/null
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('isAdminLoggedIn') === 'true';
  });

  const [isSellerLoggedIn, setIsSellerLoggedIn] = useState(() => {
    return sessionStorage.getItem('isSellerLoggedIn') === 'true';
  });
  
  const [isBuyerLoggedIn, setIsBuyerLoggedIn] = useState(() => {
    return sessionStorage.getItem('isBuyerLoggedIn') === 'true';
  });

  // JWT Token management
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('token') || null;
  });

  const [user, setUser] = useState(() => {
    const userData = sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  const [userRole, setUserRole] = useState(() => {
    return sessionStorage.getItem('userRole') || null;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('isAdminLoggedIn', isAdminLoggedIn);
    sessionStorage.setItem('isSellerLoggedIn', isSellerLoggedIn);
    sessionStorage.setItem('isBuyerLoggedIn', isBuyerLoggedIn);
    sessionStorage.setItem('token', token || '');
    sessionStorage.setItem('user', user ? JSON.stringify(user) : '');
    sessionStorage.setItem('userRole', userRole || '');
  }, [isAdminLoggedIn, isSellerLoggedIn, isBuyerLoggedIn, token, user, userRole]);

  // Function to handle successful login
  const handleLogin = (responseData) => {
    const { token: jwtToken, role, admin, seller, buyer } = responseData;
    
    setToken(jwtToken);
    setUserRole(role);
    
    // Set user data based on role
    if (role === 'ADMIN' && admin) {
      setUser(admin);
      setIsAdminLoggedIn(true);
    } else if (role === 'SELLER' && seller) {
      setUser(seller);
      setIsSellerLoggedIn(true);
    } else if (role === 'BUYER' && buyer) {
      setUser(buyer);
      setIsBuyerLoggedIn(true);
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setUserRole(null);
    setIsAdminLoggedIn(false);
    setIsSellerLoggedIn(false);
    setIsBuyerLoggedIn(false);
  };

  // Function to get auth headers for API calls
  const getAuthHeaders = () => {
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  // Function to check if user is authenticated
  const isAuthenticated = () => {
    return token && (isAdminLoggedIn || isSellerLoggedIn || isBuyerLoggedIn);
  };

  return (
    <AuthContext.Provider
      value={{
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        isSellerLoggedIn,
        setIsSellerLoggedIn,
        isBuyerLoggedIn,
        setIsBuyerLoggedIn,
        token,
        setToken,
        user,
        setUser,
        userRole,
        setUserRole,
        handleLogin,
        handleLogout,
        getAuthHeaders,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access the context
export const useAuth = () => useContext(AuthContext);