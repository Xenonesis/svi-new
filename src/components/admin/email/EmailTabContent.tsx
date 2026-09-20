import { motion, AnimatePresence } from 'motion/react';
import type { Tab, ForwardData, ReplyData, TemplatePrefill, DraftData } from './types';
import { ComposeTab } from './ComposeTab';
import { SentTab } from './SentTab';
import { RepliesTab } from './RepliesTab';
import { TemplatesTab } from './TemplatesTab';
import { DomainsTab } from './DomainsTab';
import { SettingsTab } from './SettingsTab';
import { CampaignsTab } from './CampaignsTab';
import { DeletedTab } from './DeletedTab';
import { ScheduledTab } from './ScheduledTab';
import { DraftsTab } from './DraftsTab';

export interface EmailTabContentProps {
  activeTab: Tab;
  adminEmail: string;
  forwardData: ForwardData | null;
  replyData: ReplyData | null;
  templatePrefill: TemplatePrefill | null;
  selectedDraft: DraftData | null;
  onClearPrefill: () => void;
  onOpenDraft: (draft: DraftData) => void;
  onForward: (data: ForwardData) => void;
  onReply: (data: ReplyData) => void;
  onUseTemplate: (subject: string, html: string) => void;
}

export function EmailTabContent({
  activeTab,
  adminEmail,
  forwardData,
  replyData,
  templatePrefill,
  selectedDraft,
  onClearPrefill,
  onOpenDraft,
  onForward,
  onReply,
  onUseTemplate,
}: EmailTabContentProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {activeTab === 'compose' && (
          <ComposeTab
            adminEmail={adminEmail}
            forwardData={forwardData}
            replyData={replyData}
            templatePrefill={templatePrefill}
            draftData={selectedDraft}
            onClearPrefill={onClearPrefill}
          />
        )}
        {activeTab === 'drafts' && (
          <DraftsTab onOpenDraft={onOpenDraft} onImproveDraft={onOpenDraft} />
        )}
        {activeTab === 'sent' && <SentTab onForward={onForward} onReply={onReply} />}
        {activeTab === 'replies' && (
          <RepliesTab adminEmail={adminEmail} onForward={onForward} onReply={onReply} />
        )}
        {activeTab === 'campaigns' && <CampaignsTab />}
        {activeTab === 'scheduled' && <ScheduledTab />}
        {activeTab === 'trash' && <DeletedTab />}
        {activeTab === 'templates' && <TemplatesTab onUseTemplate={onUseTemplate} />}
        {activeTab === 'domains' && <DomainsTab />}
        {activeTab === 'settings' && <SettingsTab adminEmail={adminEmail} />}
      </motion.div>
    </AnimatePresence>
  );
}
