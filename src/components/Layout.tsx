import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const Layout = ({ children, user, currentPage, onNavigate, onLogout }: LayoutProps) => {
  return (
    <div className="flex min-h-screen bg-white transition-colors duration-200">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="p-8 flex-1">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
