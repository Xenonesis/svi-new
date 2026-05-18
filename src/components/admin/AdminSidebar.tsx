'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Calculator, 
  Settings, 
  LogOut 
} from 'lucide-react';

const AdminSidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Allotment Letter', path: '/admin/allotment-letter', icon: FileText },
    { name: 'Payment Receipt', path: '/admin/payment-receipt', icon: Receipt },
    { name: 'Payment Plan', path: '/admin/payment-plan', icon: Calculator },
    { name: 'Offer Letter', path: '/admin/offer-letter', icon: FileText },
    { name: 'BBA', path: '/admin/bba', icon: FileText },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-[#0e0e14] border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold font-serif text-brand-gold">SVI Admin</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Management Portal</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-brand-gold/10 text-brand-gold font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Link 
          href="/admin/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
        <button 
          onClick={() => {
            // handle logout
          }}
          className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;