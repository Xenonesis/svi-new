import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('../RichTextEditor').then((m) => m.RichTextEditor), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
  ),
});

interface EmailBodyEditorProps {
  previewMode: boolean;
  html: string;
  templateHtml: string | null;
  subject: string;
  toStr: string;
  editorKey: number;
  setHtml: (html: string) => void;
  getPreviewHtml: () => string;
}

export function EmailBodyEditor({
  previewMode,
  html,
  subject,
  toStr,
  editorKey,
  setHtml,
  getPreviewHtml,
}: EmailBodyEditorProps) {
  return (
    <div className="relative">
      {previewMode ? (
        <div className="min-h-[400px] p-4 sm:p-6">
          <div
            className="mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-gray-700 dark:text-gray-900"
            style={{ maxWidth: '700px' }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html:
                  getPreviewHtml() ||
                  '<div style="padding:40px;text-align:center;color:#999;font-family:sans-serif;">No content yet...<br>Select a template or write your email below.</div>',
              }}
            />
          </div>
        </div>
      ) : (
        <div className="p-4">
          <RichTextEditor
            key={editorKey}
            value={html}
            onChange={setHtml}
            placeholder="Write your email here... Use the toolbar above to format text."
            recipientName={toStr.split(',')[0]?.trim()}
            subject={subject}
          />
        </div>
      )}
    </div>
  );
}
