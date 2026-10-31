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
  badgeText: 'DIWALI SPECIAL 🪔',
  text: 'SHIVANI VATIKA 11TH: FREE SCOOTY ON PLOT REGISTRY & EXCITING GIFTS',
  actionText: 'CLAIM OFFER',
  actionUrl: '/exclusive-offers',
  isExternal: false,
  dismissible: true,
};
