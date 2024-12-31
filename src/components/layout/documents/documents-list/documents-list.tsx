import DocumentCard from '@/components/layout/documents/document-card/document-card';

type DocumentsListProps = {
  documents: {
    id: string;
    title: string | null;
    content: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
};

export default function DocumentsList({ documents }: DocumentsListProps) {
  return (
    <div>
      {documents.map((document, index) => (
        <DocumentCard
          key={document.title}
          document={document}
          index={index + 1}
        />
      ))}
    </div>
  );
}
