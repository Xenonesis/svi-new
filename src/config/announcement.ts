export interface AnnouncementConfig {
  enabled: boolean;
  badgeText: string;
  text: string;
  actionText: string;
  actionUrl: string;
  isExternal?: boolean;
  dismissible?: boolean;
}

export const defaultAnnouncementConfig: AnnouncementConfig = {
  enabled: true,
  badgeText: 'NEW',
  text: 'EXCLUSIVE RESIDENTIAL & COMMERCIAL PLOTS AVAILABLE AT PRIME LOCATIONS',
  actionText: 'EXPLORE PROPERTIES',
  actionUrl: '/projects/current',
  isExternal: false,
  dismissible: true,
};
