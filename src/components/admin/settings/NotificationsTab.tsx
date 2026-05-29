'use client';

interface Notifications {
  emailAlerts: boolean;
  inAppAlerts: boolean;
  weeklyDigest: boolean;
}

interface GlobalEmailSharing {
  enabled: boolean;
}

interface NotificationsTabProps {
  notifications: Notifications;
  handleToggleNotification: (field: keyof Notifications) => Promise<void>;
  globalEmailSharing: GlobalEmailSharing;
  handleToggleGlobalEmailSharing: () => Promise<void>;
  isCompact: boolean;
}

export function NotificationsTab({
  notifications,
  handleToggleNotification,
  globalEmailSharing,
  handleToggleGlobalEmailSharing,
  isCompact,
}: NotificationsTabProps) {
  const densitySecSpacing = isCompact ? 'space-y-6' : 'space-y-8';

  return (
    <div className={densitySecSpacing}>
      {/* SECTION 1: Personal Preferences */}
      <div className="space-y-4">
        <div>
          <h2 className="text-brand-navy mb-1 font-sans font-serif text-xl font-bold dark:text-white">
            Notification Preferences
          </h2>
          <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
            Configure what system activities trigger communication dispatch channels.
          </p>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {[
            {
              id: 'emailAlerts' as const,
              title: 'Email Alert Notifications',
              description:
                'Receive full audit roundups and immediate alerts on major administrative adjustments.',
            },
            {
              id: 'inAppAlerts' as const,
              title: 'In-App Dashboard Alerts',
              description:
                'Show visual toasts and floating indicators directly in the active dashboard panel.',
            },
            {
              id: 'weeklyDigest' as const,
              title: 'Weekly Analytics digest',
              description:
                'Dispatch a weekly metric report comparing user accounts and documents created.',
            },
          ].map((channel) => {
            const isChecked = notifications[channel.id];
            return (
              <div
                key={channel.id}
                className={`flex items-center justify-between gap-6 ${isCompact ? 'py-3.5' : 'py-5'}`}
              >
                <div className="space-y-0.5 font-sans">
                  <h3 className="font-sans text-sm font-bold text-gray-900 dark:text-white">
                    {channel.title}
                  </h3>
                  <p className="max-w-lg font-sans text-xs text-gray-500 dark:text-gray-400">
                    {channel.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification(channel.id)}
                  className={`relative flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                    isChecked ? 'bg-brand-gold' : 'bg-gray-200 dark:bg-white/10'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                      isChecked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Global System/Client Communication Preferences */}
      <div className="space-y-4 border-t border-gray-100 pt-6 dark:border-white/5">
        <div>
          <h2 className="text-brand-navy mb-1 font-sans font-serif text-xl font-bold dark:text-white">
            Global Portal Settings
          </h2>
          <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
            Configure system-wide automatic client communication dispatches (applies to all users).
          </p>
        </div>

        <div className="flex items-center justify-between gap-6 py-3.5">
          <div className="space-y-0.5 font-sans">
            <h3 className="font-sans text-sm font-bold text-gray-900 dark:text-white">
              Share Action Emails to Real Address
            </h3>
            <p className="max-w-lg font-sans text-xs text-gray-500 dark:text-gray-400">
              Automatically forward transactional and administrative action updates (such as account
              generation, document uploads) to client's verified real email address.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleGlobalEmailSharing}
            className={`relative flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-300 ${
              globalEmailSharing?.enabled ? 'bg-brand-gold' : 'bg-gray-200 dark:bg-white/10'
            }`}
          >
            <span
              className={`absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                globalEmailSharing?.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
