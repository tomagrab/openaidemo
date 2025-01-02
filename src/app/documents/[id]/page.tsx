import DocumentCard from '@/components/layout/documents/document-card/document-card';
import { getDocumentById } from '@/lib/db/tables/documents/documents';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function DocumentPage({ params, searchParams }: Props) {
  const { id } = params;
  console.log(searchParams);

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
