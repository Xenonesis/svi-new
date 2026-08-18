'use client';

import { AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, RefreshCw, Send } from 'lucide-react';
import type { RefObject } from 'react';
import { WizardProgress } from '@/src/components/admin/lottery/wizard/WizardProgress';
import { LotteryDetailsForm } from '@/src/components/admin/lottery/wizard/LotteryDetailsForm';
import { ParticipantUpload } from '@/src/components/admin/lottery/wizard/ParticipantUpload';
import { LotteryReview } from '@/src/components/admin/lottery/wizard/LotteryReview';
import type { Participant } from './types';

interface CreateLotteryWizardProps {
  wizardStep: number;
  title: string;
  description: string;
  participants: Participant[];
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
  entryMethod: 'upload' | 'manual';
  dragOver: boolean;
  manualName: string;
  manualPhone: string;
  manualEmail: string;
  manualTicket: string;
  totalPages: number;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isPending: boolean;
  paginatedParticipants: Participant[];
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onSearchTermChange: (val: string) => void;
  onCurrentPageChange: (page: number) => void;
  onEntryMethodChange: (method: 'upload' | 'manual') => void;
  onManualNameChange: (val: string) => void;
  onManualPhoneChange: (val: string) => void;
  onManualEmailChange: (val: string) => void;
  onManualTicketChange: (val: string) => void;
  onDragOverChange: (drag: boolean) => void;
  onFileUpload: (file: File) => void;
  onManualAdd: () => void;
  onRemoveParticipant: (index: number) => void;
  onSetErrorMessage: (msg: string | null) => void;
  onSetSuccessMessage: (msg: string | null) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: () => void;
}

export function CreateLotteryWizard({
  wizardStep,
  title,
  description,
  participants,
  searchTerm,
  currentPage,
  itemsPerPage,
  entryMethod,
  dragOver,
  manualName,
  manualPhone,
  manualEmail,
  manualTicket,
  totalPages,
  fileInputRef,
  isPending,
  paginatedParticipants,
  onTitleChange,
  onDescriptionChange,
  onSearchTermChange,
  onCurrentPageChange,
  onEntryMethodChange,
  onManualNameChange,
  onManualPhoneChange,
  onManualEmailChange,
  onManualTicketChange,
  onDragOverChange,
  onFileUpload,
  onManualAdd,
  onRemoveParticipant,
  onSetErrorMessage,
  onSetSuccessMessage,
  onPrevStep,
  onNextStep,
  onSubmit,
}: CreateLotteryWizardProps) {
  return (
    <div className="dark:bg-brand-dark-surface/80 mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl backdrop-blur-xl md:p-12 dark:border-white/10 dark:shadow-2xl">
      <WizardProgress currentStep={wizardStep} />

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {wizardStep === 1 && (
            <LotteryDetailsForm
              title={title}
              description={description}
              onTitleChange={onTitleChange}
              onDescriptionChange={onDescriptionChange}
            />
          )}
          {wizardStep === 2 && (
            <ParticipantUpload
              participants={participants}
              searchTerm={searchTerm}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              entryMethod={entryMethod}
              dragOver={dragOver}
              manualName={manualName}
              manualPhone={manualPhone}
              manualEmail={manualEmail}
              manualTicket={manualTicket}
              totalPages={totalPages}
              fileInputRef={fileInputRef}
              onSearchTermChange={onSearchTermChange}
              onCurrentPageChange={onCurrentPageChange}
              onEntryMethodChange={onEntryMethodChange}
              onManualNameChange={onManualNameChange}
              onManualPhoneChange={onManualPhoneChange}
              onManualEmailChange={onManualEmailChange}
              onManualTicketChange={onManualTicketChange}
              onDragOverChange={onDragOverChange}
              onFileUpload={onFileUpload}
              onManualAdd={onManualAdd}
              onRemoveParticipant={onRemoveParticipant}
              onSetErrorMessage={onSetErrorMessage}
              onSetSuccessMessage={onSetSuccessMessage}
              paginatedParticipants={paginatedParticipants}
            />
          )}
          {wizardStep === 3 && (
            <LotteryReview
              title={title}
              description={description}
              participantCount={participants.length}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Wizard Navigation Buttons */}
      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={onPrevStep}
          disabled={wizardStep === 1}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-30 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-gray-500">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 w-1.5 rounded-full ${wizardStep >= s ? 'bg-brand-gold' : 'bg-slate-300 dark:bg-gray-600'}`}
              />
            ))}
          </div>
          {wizardStep < 3 ? (
            <button
              onClick={onNextStep}
              className="bg-brand-gold text-brand-navy inline-flex cursor-pointer items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all hover:opacity-90"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={isPending}
              className="bg-brand-gold text-brand-navy inline-flex cursor-pointer items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold tracking-wider uppercase transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Deploy Campaign
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
