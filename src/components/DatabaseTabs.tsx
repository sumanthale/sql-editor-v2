import React from 'react';
import { DatabaseType } from '../types/Connection';
import { Database, Server, Layers } from 'lucide-react';

interface DatabaseTabsProps {
  activeTab: DatabaseType;
  onTabChange: (tab: DatabaseType) => void;
  connectionCounts: Record<DatabaseType, number>;
}

const tabConfig = {
  PostgreSQL: {
    icon: Database,
    color: 'text-teal',
  },
  MySQL: {
    icon: Server,
    color: 'text-autumn',
  },
  Oracle: {
    icon: Layers,
    color: 'text-brick',
  },
};

export const DatabaseTabs: React.FC<DatabaseTabsProps> = ({
  activeTab,
  onTabChange,
  connectionCounts,
}) => {
  return (
    <div className="flex space-x-1 p-1 bg-theme-secondary rounded-xl shadow-theme-light">
      {(Object.keys(tabConfig) as DatabaseType[]).map((type) => {
        const Icon = tabConfig[type].icon;
        const isActive = activeTab === type;
        const count = connectionCounts[type];

        return (
          <button
            key={type}
            onClick={() => onTabChange(type)}
            className={`
              flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-150 min-w-0 flex-1
              ${isActive
                ? 'bg-synchrony-gold text-charcoal shadow-theme-medium scale-[1.03]'
                : 'text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary'}
            `}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-charcoal' : tabConfig[type].color}`} />
            <span className="truncate">{type}</span>
            {count > 0 && (
              <span
                className={`
                   w-4 h-4 text-[10px] font-bold rounded-full flex items-center justify-center
                  ${isActive
                    ? 'bg-charcoal text-synchrony-gold'
                    : 'bg-theme-accent text-synchrony-gold border border-synchrony-gold'}
                `}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
