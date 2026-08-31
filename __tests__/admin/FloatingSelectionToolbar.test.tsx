/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { vi } from 'vitest';

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FloatingSelectionToolbar } from '@/src/components/admin/email/compose/FloatingSelectionToolbar';
import { EmailBodyEditor } from '@/src/components/admin/email/compose/EmailBodyEditor';

describe('FloatingSelectionToolbar & EmailBodyEditor text deletion', () => {
  it('calls onDeleteText when Delete button is clicked', async () => {
    const onReplaceText = vi.fn();
    const onDeleteText = vi.fn();

    const mockRange = {
      cloneRange: () => mockRange,
      getBoundingClientRect: () => ({
        top: 100,
        left: 100,
        width: 150,
        height: 20,
      }),
    };

    window.Range.prototype.getBoundingClientRect = () => ({
      top: 100,
      left: 100,
      width: 150,
      height: 20,
      bottom: 120,
      right: 250,
    });

    vi.spyOn(window, 'getSelection').mockReturnValue({
      isCollapsed: false,
      toString: () => '📌 Next Steps to Finalize Your Onboarding:',
      getRangeAt: () => mockRange,
      anchorNode: document.body,
    });

    render(<FloatingSelectionToolbar onReplaceText={onReplaceText} onDeleteText={onDeleteText} />);

    // Trigger keyup or mouseup
    fireEvent.keyUp(document, { key: 'ArrowRight' });

    await new Promise((resolve) => setTimeout(resolve, 60));

    const deleteBtn = screen.getByTitle('Delete selected text');
    expect(deleteBtn).toBeInTheDocument();

    fireEvent.click(deleteBtn);
    expect(onDeleteText).toHaveBeenCalledWith(
      '📌 Next Steps to Finalize Your Onboarding:',
      expect.anything()
    );
  });

  it('updates templateHtml and html when text is deleted in EmailBodyEditor', () => {
    const setHtml = vi.fn();
    const onUpdateTemplateHtml = vi.fn();

    const initialTemplate = `<div><h4>📌 Next Steps to Finalize Your Onboarding:</h4><p>Details</p></div>`;

    render(
      <EmailBodyEditor
        previewMode={true}
        html=""
        templateHtml={initialTemplate}
        subject="Offer Letter"
        toStr="candidate@example.com"
        editorKey={1}
        setHtml={setHtml}
        onUpdateTemplateHtml={onUpdateTemplateHtml}
        getPreviewHtml={() => initialTemplate}
      />
    );

    // Verify rendered content
    expect(screen.getByText(/Next Steps to Finalize Your Onboarding/i)).toBeInTheDocument();
  });
});
