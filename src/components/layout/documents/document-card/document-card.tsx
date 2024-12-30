import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type DocumentCardProps = {
  document: {
    id: string;
    title: string | null;
    content: string | null;
    created_at: string;
    updated_at: string;
  };
};

export default function DocumentCard({ document }: DocumentCardProps) {
  const { title, content } = document;

  if (!title && !content) {
    return null;
  }

  if (!title) {
    return (
      <Card>
        <CardContent>
          <p>{content}</p>
        </CardContent>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <Badge>V-Track Knowledge Document</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{content}</p>
      </CardContent>
      <CardFooter>
        <p>
          Created at: <time>{document.created_at}</time>
          {document.updated_at && (
            <>
              {' '}
              | Updated at: <time>{document.updated_at}</time>
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  );
}
