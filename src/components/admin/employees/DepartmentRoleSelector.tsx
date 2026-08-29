'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, ChevronDown, Check, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface RoleGroup {
  department: string;
  icon: string;
  roles: Array<{
    label: string;
    value: string;
    description?: string;
  }>;
}

export const OFFER_LETTER_ROLES: RoleGroup[] = [
  {
    department: 'Sales & Business Development',
    icon: '💼',
    roles: [
      { label: 'Telecaller', value: 'Telecaller', description: 'Inbound & Outbound Calling' },
      {
        label: 'BDE (Business Development Executive)',
        value: 'BDE',
        description: 'Lead Qualification & Demos',
      },
      {
        label: 'BDM (Business Development Manager)',
        value: 'BDM',
        description: 'Client Meetings & Deal Closures',
      },
      {
        label: 'Sales Manager',
        value: 'Sales Manager',
        description: 'Sales Strategy & Target Execution',
      },
      {
        label: 'Team Leader (Sales)',
        value: 'Team Leader',
        description: 'Floor Leadership & Mentorship',
      },
    ],
  },
  {
    department: 'IT & Engineering',
    icon: '💻',
    roles: [
      {
        label: 'Software Engineer',
        value: 'Software Engineer',
        description: 'Frontend & Full-stack Systems',
      },
      {
        label: 'Full Stack Developer',
        value: 'Full Stack Developer',
        description: 'Web, Backend & Database',
      },
      { label: 'IT Executive', value: 'IT Executive', description: 'Network & System Maintenance' },
    ],
  },
  {
    department: 'Operations & Management',
    icon: '📊',
    roles: [
      {
        label: 'Project Manager',
        value: 'Project Manager',
        description: 'Timeline & Project Execution',
      },
      {
        label: 'Operations Executive',
        value: 'Operations Executive',
        description: 'Daily Field & Backoffice Ops',
      },
      {
        label: 'Legal & Accounts',
        value: 'Legal & Accounts',
        description: 'Documentation, Registry & Compliance',
      },
      {
        label: 'Field Executive',
        value: 'Field Executive',
        description: 'Site Visits & Ground Support',
      },
    ],
  },
];

export const QUICK_ROLE_PILLS = [
  'Telecaller',
  'BDE',
  'BDM',
  'Sales Manager',
  'Team Leader',
  'Software Engineer',
  'Operations Executive',
];

interface DepartmentRoleSelectorProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
}

export function DepartmentRoleSelector({
  value,
  onChange,
  label = 'Role & Department (Offer Letter Structure)',
  required = false,
}: DepartmentRoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRole = (roleValue: string) => {
    onChange(roleValue);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setSearchQuery(val);
    if (!isOpen) setIsOpen(true);
  };

  // Filter groups based on search query
  const query = searchQuery.trim().toLowerCase();
  const filteredGroups = OFFER_LETTER_ROLES.map((group) => {
    const filteredRoles = group.roles.filter(
      (r) =>
        r.label.toLowerCase().includes(query) ||
        r.value.toLowerCase().includes(query) ||
        (r.description && r.description.toLowerCase().includes(query)) ||
        group.department.toLowerCase().includes(query)
    );
    return { ...group, roles: filteredRoles };
  }).filter((group) => group.roles.length > 0);

  const isPredefined = OFFER_LETTER_ROLES.flatMap((g) => g.roles).some(
    (r) => r.value.toLowerCase() === value.trim().toLowerCase()
  );

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {value && !isPredefined && (
          <span className="bg-brand-gold/15 text-brand-gold inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
            <Sparkles size={10} /> Custom Role
          </span>
        )}
      </div>

      {/* Unified Input + Combobox Trigger */}
      <div className="relative">
        <Briefcase
          size={15}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-gray-500"
        />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Select from Offer Letter or type custom role..."
          className="focus:border-brand-gold dark:focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-16 pl-9.5 text-xs text-gray-900 transition-all focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:focus:bg-[#161622]"
        />

        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              title="Clear"
              className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200/60 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
            >
              <X size={12} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle role dropdown"
            className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 transition-transform duration-200 hover:bg-gray-200/60 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isOpen ? 'text-brand-gold rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Custom Dropdown Popover */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="scrollbar-gold absolute top-full z-50 mt-1.5 max-h-52 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#181826] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
            >
              {/* If no exact match and query typed, offer as custom */}
              {query && !isPredefined && (
                <button
                  type="button"
                  onClick={() => handleSelectRole(query)}
                  className="border-brand-gold/40 bg-brand-gold/5 text-brand-gold hover:bg-brand-gold/15 mb-2 flex w-full items-center justify-between rounded-xl border border-dashed px-3 py-2 text-left text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={13} />
                    Use &ldquo;{searchQuery}&rdquo; as Custom Designation
                  </span>
                  <span className="text-[10px] tracking-wider uppercase opacity-75">Apply</span>
                </button>
              )}

              {filteredGroups.length === 0 && !query && (
                <div className="p-3 text-center text-xs text-gray-400">
                  No predefined roles available.
                </div>
              )}

              {filteredGroups.length === 0 && query && (
                <div className="p-3 text-center text-xs text-gray-400">
                  No matching predefined roles. Click above to use custom.
                </div>
              )}

              {filteredGroups.map((group) => (
                <div key={group.department} className="mb-2.5 last:mb-0">
                  {/* Department Group Header */}
                  <div className="text-brand-gold flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase">
                    <span>{group.icon}</span>
                    <span>{group.department}</span>
                  </div>

                  {/* Role Items */}
                  <div className="mt-0.5 space-y-0.5">
                    {group.roles.map((role) => {
                      const isSelected = value.trim().toLowerCase() === role.value.toLowerCase();
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => handleSelectRole(role.value)}
                          className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all ${
                            isSelected
                              ? 'bg-brand-gold/15 text-brand-gold dark:bg-brand-gold/20 font-bold'
                              : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-white/5 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="group-hover:text-brand-gold font-medium text-gray-900 dark:text-gray-100">
                              {role.label}
                            </span>
                            {role.description && (
                              <span className="text-[10px] text-gray-500 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300">
                                {role.description}
                              </span>
                            )}
                          </div>

                          {isSelected && <Check size={14} className="text-brand-gold shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Preset Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">Quick:</span>
        {QUICK_ROLE_PILLS.map((preset) => {
          const isSelected = value === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => handleSelectRole(preset)}
              className={`rounded-lg border px-2 py-0.5 text-[10px] font-semibold transition-all active:scale-95 ${
                isSelected
                  ? 'border-brand-gold bg-brand-gold/15 text-brand-gold shadow-sm'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-gray-200'
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>
    </div>
  );
}
