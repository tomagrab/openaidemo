import DocumentCard from '@/components/layout/documents/document-card/document-card';
import { getDocumentById } from '@/lib/db/tables/documents/documents';
import { JSX } from 'react';

type DocumentPageProps = {
  params: {
    id: string;
  };
};

export default async function DocumentPage({
  params,
}: DocumentPageProps): Promise<JSX.Element> {
  const { id } = await params;

  if (!id) {
    return <div>Document not found</div>;
  }

  const document = await getDocumentById(id);

  console.log(document);

  if (!document) {
    return <div>Document not found</div>;
  }

  return (
    <div className="flex flex-1">
      <DocumentCard document={document} />
    </div>
  );
}
