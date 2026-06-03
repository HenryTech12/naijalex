import React from 'react';
import { Navbar } from '../layout/Navbar';
import { Footer } from '../layout/Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />
      {children}
      {showFooter && <Footer />}
    </div>
  );
};
