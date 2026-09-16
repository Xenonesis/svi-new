'use client';

import React from 'react';
import { LeaderboardCard } from '@/src/components/admin/leads/LeaderboardCard';

export interface AdvisorLeaderboardGridProps {
  totalCalls: number;
  answeredCalls: number;
  hotLeads: number;
}

export function AdvisorLeaderboardGrid({
  totalCalls,
  answeredCalls,
  hotLeads,
}: AdvisorLeaderboardGridProps): React.JSX.Element {
  return (
    <LeaderboardCard totalCalls={totalCalls} answeredCalls={answeredCalls} hotLeads={hotLeads} />
  );
}
