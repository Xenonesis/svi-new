import '@testing-library/jest-dom/vitest';

// Provide safe fallback env vars in unit test environment if not defined
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-supabase.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key-for-unit-tests';
