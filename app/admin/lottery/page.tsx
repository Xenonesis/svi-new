'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { useLotteryData } from '@/src/components/admin/lottery/hooks/useLotteryData';
import { useParticipantManagement } from '@/src/components/admin/lottery/hooks/useParticipantManagement';
import { useScheduleDraw } from '@/src/components/admin/lottery/hooks/useScheduleDraw';
import { useLotteryWizard } from '@/src/components/admin/lottery/hooks/useLotteryWizard';
import { useLotteryModals } from '@/src/components/admin/lottery/hooks/useLotteryModals';
import { LotteryHeader } from '@/src/components/admin/lottery/LotteryHeader';
import { LotteryStatusBanners } from '@/src/components/admin/lottery/LotteryStatusBanners';
import { LotteryViewsContainer } from '@/src/components/admin/lottery/LotteryViewsContainer';
import { LotteryModalsContainer } from '@/src/components/admin/lottery/LotteryModalsContainer';

export default function AdminLotteryPage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create'>('dashboard');
  const lotteryData = useLotteryData();
  const participantMgmt = useParticipantManagement();
  const { fetchSchedule, resetScheduleState } = useScheduleDraw();
  const modals = useLotteryModals();

  const wizard = useLotteryWizard({
    activeLottery: lotteryData.activeLottery,
    token,
    participants: participantMgmt.participants,
    setParticipants: participantMgmt.setParticipants,
    setActiveTab,
    fetchLotteries: lotteryData.fetchLotteries,
    setErrorMessage: lotteryData.setErrorMessage,
    setSuccessMessage: lotteryData.setSuccessMessage,
  });

  useEffect(() => {
    if (lotteryData.activeLottery && token) fetchSchedule(lotteryData.activeLottery.id, token);
    else resetScheduleState();
  }, [lotteryData.activeLottery, token, fetchSchedule, resetScheduleState]);

  return (
    <>
      <div className="space-y-8 pb-12 text-slate-900 transition-colors duration-300 dark:text-slate-100">
        <LotteryHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onNewLottery={() => {
            setActiveTab('create');
            wizard.setWizardStep(1);
          }}
          onSyncExisting={() => token && lotteryData.handleSyncExisting(token)}
          syncing={lotteryData.syncing}
          canSync={!!token}
        />
        <LotteryStatusBanners
          errorMessage={lotteryData.errorMessage}
          successMessage={lotteryData.successMessage}
          onDismissError={() => lotteryData.setErrorMessage(null)}
          onDismissSuccess={() => lotteryData.setSuccessMessage(null)}
        />
        <LotteryViewsContainer
          activeTab={activeTab}
          token={token}
          lotteryData={lotteryData}
          participantMgmt={participantMgmt}
          wizard={wizard}
          modals={modals}
          onTabChange={setActiveTab}
        />
      </div>
      <LotteryModalsContainer
        token={token}
        modals={modals}
        onLotteriesChanged={lotteryData.fetchLotteries}
        onError={lotteryData.setErrorMessage}
        onSuccess={lotteryData.setSuccessMessage}
      />
    </>
  );
}
