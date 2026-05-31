import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-textPrimary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl">NaijaLex</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              AI-powered legal document understanding for Nigerian SMEs. Fast, affordable, and accessible.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/analyze" className="text-white/70 hover:text-white text-sm transition-colors">
                  Analyze a Contract
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/70 hover:text-white text-sm transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Legal</h3>
            <div className="flex items-start gap-2 bg-white/5 rounded-lg p-3 border border-white/10">
              <AlertTriangle className="w-4 h-4 text-warning-500 shrink-0 mt-0.5" />
              <p className="text-white/60 text-xs leading-relaxed">
                NaijaLex is not legal advice. Always consult a qualified Nigerian lawyer for complex legal matters.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} NaijaLex. Built for AfriLab Lagos Hackathon.
          </p>
          <p className="text-white/40 text-sm">
            Powered by AI &mdash; Trusted by Nigerian businesses
          </p>
        </div>
      </div>
    </footer>
  );
};
