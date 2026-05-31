import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, FileText } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLanding
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-sm border-b border-brand-border shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span className={`font-bold text-xl tracking-tight ${isLanding ? 'text-white' : 'text-brand-textPrimary'}`}>
              NaijaLex
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isLanding
                  ? 'text-white/80 hover:text-white'
                  : 'text-brand-textSecondary hover:text-brand-textPrimary'
              }`}
            >
              Home
            </Link>
            <Link
              to="/analyze"
              className={`text-sm font-medium transition-colors ${
                isLanding
                  ? 'text-white/80 hover:text-white'
                  : 'text-brand-textSecondary hover:text-brand-textPrimary'
              }`}
            >
              Analyze
            </Link>
          </nav>

          <Link
            to="/analyze"
            className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <FileText className="w-4 h-4" />
            <span>Analyze Contract</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
