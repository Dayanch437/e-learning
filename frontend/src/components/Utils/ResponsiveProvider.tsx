import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined);

export const useResponsive = (): ResponsiveContextType => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
};

interface ResponsiveProviderProps {
  children: ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 992);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 992);
      setIsDesktop(window.innerWidth >= 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ResponsiveContext.Provider value={{ isMobile, isTablet, isDesktop }}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export default ResponsiveProvider;