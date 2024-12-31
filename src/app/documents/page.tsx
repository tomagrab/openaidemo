import DocumentsTable from '@/components/layout/documents/document-table/document-table';
import { getDocuments } from '@/lib/db/tables/documents/documents';

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h2 className="text-xl font-semibold">Documents</h2>

      <DocumentsTable data={documents} />
    </div>
  );
}
