import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  BrandedLoadingState,
  VerificationStep,
} from '@/src/components/employee/BrandedLoadingState';

// Mock Next.js Image component for test environment
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} alt={props.alt || ''} />,
}));

describe('BrandedLoadingState Component', () => {
  it('renders default message and subMessage in loading state', () => {
    render(<BrandedLoadingState />);

    expect(screen.getByText('Synchronizing SVI Workspace...')).toBeDefined();
    expect(screen.getByText('Securing connection & verifying credentials')).toBeDefined();
    expect(screen.getByAltText('SVI Infra Solutions')).toBeDefined();
  });

  it('renders customized message and subMessage correctly', () => {
    render(
      <BrandedLoadingState
        message="Checking Attendance Status & Geofence..."
        subMessage="Syncing shift timing rules and active office zones"
      />
    );

    expect(screen.getByText('Checking Attendance Status & Geofence...')).toBeDefined();
    expect(screen.getByText('Syncing shift timing rules and active office zones')).toBeDefined();
  });

  it('renders progressive verification steps correctly', () => {
    const steps: VerificationStep[] = [
      { id: 'gps', label: 'GPS Lock', status: 'completed' },
      { id: 'geofence', label: 'Geofence Check', status: 'in_progress' },
      { id: 'rules', label: 'Shift Rules', status: 'pending' },
    ];

    render(<BrandedLoadingState steps={steps} message="Verifying Attendance Clearance..." />);

    expect(screen.getByText('GPS Lock')).toBeDefined();
    expect(screen.getByText('Geofence Check')).toBeDefined();
    expect(screen.getByText('Shift Rules')).toBeDefined();
  });

  it('renders timeout state with retry and offline action buttons and triggers callbacks', () => {
    const onRetry = vi.fn();
    const onOfflineFallback = vi.fn();

    render(
      <BrandedLoadingState
        status="timeout"
        message="Verification Delayed"
        subMessage="Satellite or network lock is taking longer than usual"
        onRetry={onRetry}
        onOfflineFallback={onOfflineFallback}
      />
    );

    expect(screen.getByText('Verification Delayed')).toBeDefined();
    expect(screen.getByText('Satellite or network lock is taking longer than usual')).toBeDefined();

    const retryBtn = screen.getByText('Retry Location');
    const offlineBtn = screen.getByText('Punch in Offline Mode');

    expect(retryBtn).toBeDefined();
    expect(offlineBtn).toBeDefined();

    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);

    fireEvent.click(offlineBtn);
    expect(onOfflineFallback).toHaveBeenCalledTimes(1);
  });

  it('renders success state with verified styling', () => {
    render(
      <BrandedLoadingState
        status="success"
        message="Attendance Verified & Ready"
        subMessage="Geofence locked and shift policies synchronized"
      />
    );

    expect(screen.getByText('Attendance Verified & Ready')).toBeDefined();
    expect(screen.getByText('Geofence locked and shift policies synchronized')).toBeDefined();
  });
});
