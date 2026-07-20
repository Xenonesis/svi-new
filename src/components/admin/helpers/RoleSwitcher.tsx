'use client';

import React from 'react';
import { Badge } from './Badge';
import { ChevronDown } from 'lucide-react';

interface RoleSwitcherProps {
  role: string;
  onRoleChange: (newRole: string) => void;
  disabled?: boolean;
}

export function RoleSwitcher({ role, onRoleChange, disabled }: RoleSwitcherProps) {
  return (
    <div className="group relative inline-flex cursor-pointer items-center gap-1">
      <select
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
        disabled={disabled}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      >
        <option value="client">User</option>
        <option value="employee">Employee</option>
        <option value="admin">Admin</option>
      </select>
      <Badge role={role} />
      {!disabled && (
        <ChevronDown className="h-3 w-3 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </div>
  );
}
