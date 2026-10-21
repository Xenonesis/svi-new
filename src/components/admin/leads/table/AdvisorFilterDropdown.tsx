import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import { UserCheck, ChevronDown, Search, Check } from 'lucide-react';
interface AdvisorFilterDropdownProps {
  employees: Employee[];
  selectedAdvisorId: string;
  onChange: (id: string) => void;
}

export function AdvisorFilterDropdown({
  employees,
  selectedAdvisorId,
  onChange,
}: AdvisorFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedEmployee = employees.find((e) => e.id === selectedAdvisorId);
  const selectedLabel = selectedEmployee ? selectedEmployee.full_name : 'All Advisors';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredEmployees = employees.filter((emp) =>
    emp.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
          selectedAdvisorId !== 'all'
            ? 'border-brand-gold/40 bg-brand-gold/10 text-brand-gold font-semibold shadow-sm'
            : 'border-gray-200 bg-gray-50/80 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Filter by assigned advisor"
      >
        <UserCheck
          className={`h-3.5 w-3.5 ${
            selectedAdvisorId !== 'all' ? 'text-brand-gold' : 'text-gray-400 dark:text-gray-400'
          }`}
        />
        <span className="max-w-[140px] truncate">{selectedLabel}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 z-50 mt-1.5 max-w-[280px] min-w-[240px] rounded-2xl border border-gray-200/80 bg-white p-1.5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#12121a]"
            role="listbox"
          >
            {employees.length > 5 && (
              <div className="p-1 pb-1.5">
                <div className="relative">
                  <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search advisor..."
                    className="focus:border-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-xs text-gray-900 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-[260px] space-y-0.5 overflow-x-hidden overflow-y-auto">
              {/* All Advisors Option */}
              <button
                type="button"
                onClick={() => {
                  onChange('all');
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                  selectedAdvisorId === 'all'
                    ? 'bg-brand-gold/15 text-brand-gold font-semibold'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
                role="option"
                aria-selected={selectedAdvisorId === 'all'}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200/70 text-[10px] font-bold text-gray-700 dark:bg-white/10 dark:text-gray-300">
                    ALL
                  </div>
                  <span>All Advisors</span>
                </div>
                {selectedAdvisorId === 'all' && <Check className="text-brand-gold h-3.5 w-3.5" />}
              </button>

              {/* Individual Advisor Options */}
              {filteredEmployees.map((emp) => {
                const isSelected = selectedAdvisorId === emp.id;
                const initials = emp.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      onChange(emp.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                      isSelected
                        ? 'bg-brand-gold/15 text-brand-gold font-semibold'
                        : 'text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/5 dark:hover:text-white'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="bg-brand-gold/15 text-brand-gold flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                        {initials}
                      </div>
                      <span className="truncate">{emp.full_name}</span>
                      {emp.is_active === false && (
                        <span className="rounded-md border border-red-500/20 bg-red-50 px-1 py-0.5 text-[9px] font-semibold text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-400">
                          Disabled
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="text-brand-gold h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}

              {filteredEmployees.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-gray-400">No advisors found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

