'use client';

import { Clock } from 'lucide-react';
import { motion } from 'motion/react';
// import { Download, FileText, Settings, UserPlus } from 'lucide-react';

interface Activity {
  id: string;
  type: 'document' | 'user' | 'settings' | 'download' | 'attendance';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

/* const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'document':
      return FileText;
    case 'user':
      return UserPlus;
    case 'settings':
      return Settings;
    case 'download':
      return Download;
    default:
      return Clock;
  }
}; */

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'document':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'user':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'settings':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'download':
      return 'bg-brand-gold/20 text-brand-gold border-brand-gold/30';
    case 'attendance':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="dark:bg-brand-dark-surface/65 rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Latest actions</p>
        </div>
      </div>

      <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <Clock className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            // const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="relative ml-3 flex gap-4 border-l-2 border-gray-200 pb-4 pl-6 last:border-0 dark:border-gray-700"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute top-0 -left-[9px] h-4 w-4 rounded-full border-2 ${colorClass}`}
                />

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                        {activity.description}
                      </p>
                      {activity.user && (
                        <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                          by {activity.user}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] whitespace-nowrap text-gray-400 dark:text-gray-500">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
