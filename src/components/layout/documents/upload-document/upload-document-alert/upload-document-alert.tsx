'use client';

import { MarkdownRenderer } from '@/components/layout/markdown/markdown-renderer/markdown-renderer';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type UploadDocumentAlertProps = {
  alertOpen: boolean;
  setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
  existingDocuments: {
    title: string;
    content: string;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
  }[];
};

export default function UploadDocumentAlert({
  alertOpen,
  setAlertOpen,
  existingDocuments,
}: UploadDocumentAlertProps) {
  return (
    <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Document Already Exists</AlertDialogTitle>
        </AlertDialogHeader>
        {existingDocuments.map((document, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>{document.title}</CardTitle>
              <CardDescription>
                <Badge>V-Track Knowledge Document</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={document.content} />
            </CardContent>
            <CardFooter className="flex justify-between">
              {document.createdAt ? (
                <p>
                  Created at:
                  <time>
                    {new Date(document.createdAt).toLocaleDateString()}
                  </time>
                </p>
              ) : null}
              {document.updatedAt ? (
                <p>
                  Updated at:
                  <time>
                    {new Date(document.updatedAt).toLocaleDateString()}
                  </time>
                </p>
              ) : null}
            </CardFooter>
          </Card>
        ))}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setAlertOpen(false)}>
            Word
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
