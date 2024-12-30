import DocumentCard from '@/components/layout/documents/document-card/document-card';

type DocumentsListProps = {
  documents: {
    id: string;
    title: string | null;
    content: string | null;
    created_at: string;
    updated_at: string;
  }[];
};

export default function DocumentsList({ documents }: DocumentsListProps) {
  return (
    <div>
      {documents.map(document => (
        <DocumentCard key={document.title} document={document} />
      ))}
    </div>
  );
}
