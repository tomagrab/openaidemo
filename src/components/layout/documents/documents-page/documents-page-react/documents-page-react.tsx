'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useState } from 'react';
import DocumentsPageViewPanel from './documents-page-react-view-panel/documents-page-react-view-panel';
import UploadDocument from '../../upload-document/upload-document';
import SearchDocuments from '../../search-document/search-document';

export default function DocumentsPageReact() {
  const [view, setView] = useState<
    'all' | 'upload-document' | 'search-documents'
  >('all');
  return (
    <div className="flex flex-1">
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
        <ResizablePanel defaultSize={10} className="flex items-start p-6">
          <DocumentsPageViewPanel view={view} setView={setView} />
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
