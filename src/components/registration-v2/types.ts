import type React from 'react';
import type { FormData } from '@/src/types/registration';

export type RegistrationV2Step = 1 | 2 | 3 | 4;

export interface SchemeBreakdown {
  sqYards: number;
  sqFeet: number;
  tokenAmount: number;
  planDescription: string;
}

export interface StepProps {
  formData: FormData;
  errors: Record<string, string>;
  attempted: boolean;
  t: (key: string) => string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}
