import DocumentsPageReact from '@/components/layout/documents/documents-page/documents-page-react/documents-page-react';

export default function DocumentsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <h2 className="text-xl font-semibold">Documents</h2>

      <DocumentsPageReact />
    </div>
  );
}
