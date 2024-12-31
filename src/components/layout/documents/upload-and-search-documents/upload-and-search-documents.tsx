'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useState } from 'react';
import UploadAndSearchDocumentsViewPanel from '@/components/layout/documents/upload-and-search-documents/upload-and-search-documents-view-panel/upload-and-search-documents-view-panel';
import UploadDocument from '@/components/layout/documents/upload-document/upload-document';
import SearchDocuments from '@/components/layout/documents/search-documents/search-documents';

export default function UploadAndSearchDocuments() {
  const [view, setView] = useState<
    'all' | 'upload-document' | 'search-documents'
  >('all');
  return (
    <div className="flex flex-1">
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
        <ResizablePanel defaultSize={10} className="flex items-start p-6">
          <UploadAndSearchDocumentsViewPanel view={view} setView={setView} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <ResizablePanelGroup direction="vertical">
            {view === 'all' || view === 'upload-document' ? (
              <ResizablePanel>
                <UploadDocument />
              </ResizablePanel>
            ) : null}

            {view === 'all' ? <ResizableHandle /> : null}

            {view === 'all' || view === 'search-documents' ? (
              <ResizablePanel>
                <SearchDocuments />
              </ResizablePanel>
            ) : null}
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
