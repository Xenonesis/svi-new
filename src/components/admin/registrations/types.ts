export const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

export const STATUS_OPTIONS = [
  {
    value: 'pending',
    label: 'Pending',
    color:
      'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-500/30',
  },
  {
    value: 'contacted',
    label: 'Contacted',
    color:
      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500/30',
  },
  {
    value: 'approved',
    label: 'Approved',
    color:
      'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/30',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    color:
      'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-500/30',
  },
];

export const STATUS_MAP: Record<string, (typeof STATUS_OPTIONS)[number]> = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s])
);

export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date' },
  { value: 'submission_id', label: 'Submission ID' },
  { value: 'name', label: 'Name' },
  { value: 'project', label: 'Project' },
  { value: 'advisor_name', label: 'Advisor' },
  { value: 'property_type', label: 'Property Type' },
  { value: 'scheme_amount', label: 'Scheme Amount' },
  { value: 'status', label: 'Status' },
];

export interface Registration {
  id: string;
  submission_id: string | null;
  name: string;
  last_name: string | null;
  email: string;
  phone: string;
  so_wo_do: string | null;
  preferred_date: string | null;
  aadhar_number: string | null;
  pan_number: string | null;
  photo_url: string | null;
  pan_card_file_url: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  advisor_name: string | null;
  project: string | null;
  property_size: string | null;
  property_type: string | null;
  plot_preference: string | null;
  payment_plan: string | null;
  payment_mode: string | null;
  scheme_amount: string | null;
  property_interest: string | null;
  message: string | null;
  status: string;
  is_important?: boolean;
  created_at: string;
}

export interface FilterOptions {
  projects: string[];
  advisors: string[];
  propertyTypes: string[];
  propertySizes: string[];
  plotPreferences: string[];
  paymentPlans: string[];
  paymentModes: string[];
}

export interface Filters {
  project: string;
  advisor: string;
  propertyType: string;
  propertySize: string;
  plotPreference: string;
  paymentPlan: string;
  paymentMode: string;
  dateFrom: string;
  dateTo: string;
  status: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
}
