import DocumentCard from '@/components/layout/documents/document-card/document-card';
import { getDocumentById } from '@/lib/db/tables/documents/documents';

interface DocumentPageProps {
  params: {
    id: string;
  };
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { id } = params;

  if (!id) {
    return <div>Document not found</div>;
  }

  const document = await getDocumentById(id);

  if (!document) {
    return <div>Document not found</div>;
  }

  return (
    <div className="flex flex-1">
      <DocumentCard document={document} />
    </div>
  );
}
