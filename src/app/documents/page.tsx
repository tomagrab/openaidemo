import SearchDocuments from '@/components/layout/documents/search-document/search-document';
import UploadDocument from '@/components/layout/documents/upload-document/upload-document';
import { Separator } from '@/components/ui/separator';

export default function DocumentsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2>Documents</h2>

      <Separator />

      <div className="grid grid-cols-2 gap-2">
        <UploadDocument />
        <SearchDocuments />
      </div>
    </div>
  );
}
