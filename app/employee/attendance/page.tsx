'use client';

import React from 'react';
import { PunchTerminalWidget } from '@/src/components/employee/attendance/PunchTerminalWidget';
import { GeofenceStatusCard } from '@/src/components/employee/attendance/GeofenceStatusCard';
import { ShiftGuidelinesCard } from '@/src/components/employee/attendance/ShiftGuidelinesCard';
import { PunchOutWorkLogModal } from '@/src/components/employee/attendance/PunchOutWorkLogModal';
import { PunchFeedbackBanner } from '@/src/components/employee/attendance/PunchFeedbackBanner';
import { BrandedLoadingState } from '@/src/components/employee/BrandedLoadingState';
import { useEmployeeAttendanceTerminal } from '@/src/components/employee/attendance/useEmployeeAttendanceTerminal';
import { AttendanceHeader } from '@/src/components/employee/attendance/AttendanceHeader';
import { AttendanceOfflineBanner } from '@/src/components/employee/attendance/AttendanceOfflineBanner';
import { CompletedShiftSummaryCard } from '@/src/components/employee/attendance/CompletedShiftSummaryCard';

export default function EmployeeAttendancePunchPage() {
  const {
    statusData,
    settings,
    locations,
    loading,
    punching,
    elapsedTime,
    locationStatus,
    coords,
    accuracy,
    showWorkLogModal,
    setShowWorkLogModal,
    workSummary,
    setWorkSummary,
    clientCount,
    setClientCount,
    visitCount,
    setVisitCount,
    feedbackNotice,
    setFeedbackNotice,
    offlineQueue,
    isSyncingOffline,
    handleSyncOffline,
    requestLocation,
    fetchStatus,
    executePunch,
  } = useEmployeeAttendanceTerminal();

  if (loading) {
    return (
      <BrandedLoadingState
        message="Checking Attendance Status & Geofence..."
        subMessage="Syncing shift timing rules and active office zones"
      />
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Employee Profile Banner & Quick Refresh */}
      <AttendanceHeader
        fullName={statusData.full_name}
        teamName={statusData.team_name}
        onRefresh={fetchStatus}
      />

      {/* Actionable Feedback Banner */}
      <PunchFeedbackBanner notice={feedbackNotice} onDismiss={() => setFeedbackNotice(null)} />

      {/* Offline Punch Sync Notice Banner */}
      <AttendanceOfflineBanner
        queueCount={offlineQueue.length}
        isSyncing={isSyncingOffline}
        onSync={handleSyncOffline}
      />

      {/* Primary Interaction Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Punch Interaction Terminal */}
        <div className="lg:col-span-7 xl:col-span-8">
          <PunchTerminalWidget
            statusData={statusData}
            elapsedTime={elapsedTime}
            punching={punching}
            settings={settings}
            onPunchIn={() => executePunch('in')}
            onPunchOutClick={() => setShowWorkLogModal(true)}
            queuedPunchesCount={offlineQueue.length}
            onSyncOffline={handleSyncOffline}
            isSyncingOffline={isSyncingOffline}
            userId={statusData.user_id}
          />
        </div>

        {/* Location Radar & Geofence Intelligence Status */}
        <div className="space-y-6 lg:col-span-5 xl:col-span-4">
          <GeofenceStatusCard
            locationStatus={locationStatus}
            coords={coords}
            accuracy={accuracy}
            isGeofenceVerified={statusData.is_geofence_verified}
            activeLocations={locations}
            onRefreshLocation={requestLocation}
            onRequestPermission={requestLocation}
          />
          <ShiftGuidelinesCard settings={settings} />
        </div>
      </div>

      {/* Completed Shift Summary */}
      <CompletedShiftSummaryCard statusData={statusData} />

      {/* Work Summary Modal on Punch-Out */}
      <PunchOutWorkLogModal
        isOpen={showWorkLogModal}
        onClose={() => setShowWorkLogModal(false)}
        workSummary={workSummary}
        onWorkSummaryChange={setWorkSummary}
        clientCount={clientCount}
        onClientCountChange={setClientCount}
        visitCount={visitCount}
        onVisitCountChange={setVisitCount}
        onConfirmPunchOut={() => executePunch('out')}
        punching={punching}
      />
    </div>
  );
}
