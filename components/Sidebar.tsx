
import React from 'react';
import { Book, Users, Map, Calendar, Settings, Feather, LogOut } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout }) => {
  const navItems = [
    { view: AppView.DASHBOARD, label: 'Dashboard', icon: Book },
    { view: AppView.CHARACTERS, label: 'Characters', icon: Users },
    { view: AppView.PLACES, label: 'Places', icon: Map },
    { view: AppView.TIMELINE, label: 'Timeline', icon: Calendar },
    { view: AppView.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-lore-800 border-r border-lore-700 flex flex-col h-full shadow-2xl z-10">
      <div className="p-6 flex items-center gap-3 border-b border-lore-700">
        <div className="p-2 bg-lore-accent rounded-lg text-lore-900">
            <Feather size={24} />
        </div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">LoreBook</h1>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onChangeView(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-lore-700 text-lore-accent shadow-lg' 
                  : 'text-lore-300 hover:bg-lore-700/50 hover:text-lore-100'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-lore-accent' : 'text-lore-400 group-hover:text-lore-200'} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-lore-700 space-y-4">
        <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-lore-400 hover:text-danger hover:bg-lore-700/30 rounded-lg transition-colors text-sm"
        >
            <LogOut size={16} />
            <span>Sign Out</span>
        </button>
        <div className="text-xs text-lore-600 text-center">
             v1.0.0 &bull; Powered by Gemini
        </div>
      </div>
    </div>
  );
};
