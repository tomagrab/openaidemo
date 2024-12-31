'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dispatch, SetStateAction } from 'react';

type DocumentsPageViewPanelProps = {
  view: 'all' | 'upload-document' | 'search-documents';
  setView: Dispatch<
    SetStateAction<'all' | 'upload-document' | 'search-documents'>
  >;
};

export default function DocumentsPageViewPanel({
  view,
  setView,
}: DocumentsPageViewPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg">Views</h3>
      <RadioGroup
        defaultValue="all"
        value={view}
        onValueChange={value =>
          setView(value as 'all' | 'upload-document' | 'search-documents')
        }
        className="flex flex-col gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="r1" />
          <Label htmlFor="r1">All</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="upload-document" id="r2" />
          <Label htmlFor="r2">Upload Documents</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="search-documents" id="r3" />
          <Label htmlFor="r3">Search Documents</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
