'use client';

type Tab = 'emi' | 'roi';

type TabItem = {
  id: Tab;
  label: string;
};

type TabSwitcherProps = {
  tabs: TabItem[];
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export default function TabSwitcher({ tabs, activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="mb-8 flex rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 cursor-pointer rounded-full py-3 text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
            activeTab === tab.id
              ? 'bg-brand-gold text-brand-navy shadow-md'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
