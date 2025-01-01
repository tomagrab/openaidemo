import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MarkdownRenderer } from '@/components/layout/markdown/markdown-renderer/markdown-renderer';

type DocumentCardProps = {
  index?: number | null | undefined;
  document: {
    id: string;
    title: string | null;
    content: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export default function DocumentCard({ index, document }: DocumentCardProps) {
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {index ? <Badge className="text-sm"># {index}</Badge> : null}
          {title}
        </CardTitle>
        <CardDescription>
          <Badge>V-Track Knowledge Document</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MarkdownRenderer content={content} />
      </CardContent>
      <CardFooter className="flex justify-between">
        <p>
          Created at:
          <time>{new Date(document.createdAt).toLocaleDateString()}</time>
        </p>
        <p>
          Updated at:
          <time>{new Date(document.createdAt).toLocaleDateString()}</time>
        </p>
      </CardFooter>
    </Card>
  );
}
