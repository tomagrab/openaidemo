'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import { toast } from 'sonner';
import UploadDocumentAlert from './upload-document-alert/upload-document-alert';
import { uploadDocumentAction } from '@/app/server/actions/documents/document-actions/document-actions';

export default function UploadDocument() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [existingDocuments, setExistingDocuments] = useState<
    | {
        title: string;
        content: string;
        createdAt: Date | undefined;
        updatedAt: Date | undefined;
      }[]
    | null
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
      const result = await uploadDocumentAction({ title, content });

      // Handle the result
      const documents = result;

      if (Array.isArray(documents)) {
        // Possibly 1 new doc, or multiple existing docs
        if (
          documents.length === 1 &&
          documents[0].title === title &&
          documents[0].content === content
        ) {
          // It's brand new
          toast.success(`Document inserted: ${documents[0].title}`);
        } else {
          // This is an existing doc or multiple docs
          setExistingDocuments(documents);
          setAlertOpen(true);
          toast.warning('Document found in DB');
        }
      } else {
        // Probably an error object
        toast.error(documents.error ?? 'Some error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Upload error: ${errorMessage}`);
    } finally {
      setTitle('');
      setContent('');
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
        <UploadDocumentAlert
          alertOpen={alertOpen}
          setAlertOpen={setAlertOpen}
          existingDocuments={existingDocuments}
        />
      ) : null}
    </div>
  );
}
