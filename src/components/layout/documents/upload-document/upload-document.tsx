'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { MarkdownRenderer } from '../../markdown/markdown-renderer/markdown-renderer';
import { Badge } from '@/components/ui/badge';

export default function UploadDocument() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [existingDocuments, setExistingDocuments] = useState<
    | null
    | {
        title: string;
        content: string;
        createdAt: string;
        updatedAt: string;
      }[]
  >(null);

  // When user picks a file from their system
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMessage(null); // reset any messages
    const file = e.target.files?.[0];
    if (!file) return;

    // If you want to double-check extension in code, do it here:
    const isMarkdownOrText = /\.(md|txt)$/i.test(file.name);
    if (!isMarkdownOrText) {
      setMessage('Please upload a .md or .txt file');
      return;
    }

    try {
      // Read text from file
      const fileText = await file.text();

      // If the user hasn't typed a custom title, let's fill it with either a heading or fallback
      if (!title) {
        // remove extension e.g. "readme.md" -> "readme"
        const fileNameNoExt = file.name.replace(/\.(md|txt)$/i, '');

        // If it's a .md file, try to parse the first # heading
        if (file.name.toLowerCase().endsWith('.md')) {
          // Look for a line starting with `#` followed by some text
          const headingMatch = fileText.match(/^[ \t]*#[ \t]+(.+)/m);
          if (headingMatch) {
            // headingMatch[1] is the capture group after "# "
            const headingFromFile = headingMatch[1].trim();
            setTitle(headingFromFile);
          } else {
            // fallback if no heading found
            setTitle(fileNameNoExt);
          }
        } else {
          // If it's a .txt file, just use the filename
          setTitle(fileNameNoExt);
        }
      }

      // Put the file’s text into `content`.
      setContent(fileText);
    } catch (err) {
      setMessage(`Could not read file: ${String(err)}`);
    }
  }

  async function handleUploadDocument() {
    setLoading(true);

    try {
      const url = `/api/documents/upload-document?title=${encodeURIComponent(
        title,
      )}&content=${encodeURIComponent(content)}`;

      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        toast.error(`Upload failed: ${err.error}`);
        return;
      }

      const document = await res.json();
      // document is presumably either newly created or an existing row.
      // For now, let’s assume it’s existing if document.title != the user’s input,
      // or document.content != the user’s input, or if document was found by the unique constraints.

      if (document.title !== title || document.content !== content) {
        // We consider it “existing”
        setExistingDocuments(document);
        setAlertOpen(true);
        toast.warning('Document found in DB');
      } else {
        // Inserted brand new document
        toast.success(`Document inserted: ${document.title}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Upload error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4 rounded border p-4">
      <h3 className="text-lg font-semibold">Upload Document</h3>

      {/* FILE PICKER */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="fileInput">Upload file (.md or .txt)</Label>
        <Input
          id="fileInput"
          type="file"
          accept=".md,.txt"
          onChange={handleFileChange}
        />
      </div>

      {/* TITLE FIELD */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="titleInput">Title</Label>
        <Input
          id="titleInput"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Document Title"
        />
      </div>

      {/* CONTENT FIELD */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="contentTextarea">Content</Label>
        <textarea
          id="contentTextarea"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={6}
          className="w-full rounded-md border p-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Document text goes here..."
        />
      </div>

      {/* UPLOAD BUTTON */}
      <Button
        variant="default"
        disabled={loading || !title || !content}
        onClick={handleUploadDocument}
      >
        {loading ? 'Uploading...' : 'Upload'}
      </Button>

      {/* FEEDBACK MESSAGE */}
      {message && <div className="mt-2 text-sm">{message}</div>}

      {existingDocuments && existingDocuments.length > 0 ? (
        <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Document Already Exists</AlertDialogTitle>
              {existingDocuments.map((document, i) => (
                <Card key={i} className="mt-2">
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
                    <p>
                      Created at:
                      <time>
                        {new Date(document.createdAt).toLocaleDateString()}
                      </time>
                    </p>
                    <p>
                      Updated at:
                      <time>
                        {new Date(document.createdAt).toLocaleDateString()}
                      </time>
                    </p>
                  </CardFooter>
                </Card>
              ))}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAlertOpen(false)}>
                Word
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}
