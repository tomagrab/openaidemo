'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type SearchResult = {
  id: number | string;
  title: string | null;
  content: string | null;
  distance: number;
};

export default function SearchDocuments() {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSearch() {
    setLoading(true);
    setErrorMsg(null);

    try {
      const url = `/api/documents/search-documents?query=${encodeURIComponent(
        query,
      )}&limit=${encodeURIComponent(limit)}`;

      const res = await fetch(url);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      const data = await res.json();
      setResults(data);
    } catch (error) {
      setErrorMsg(`Error: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded border p-4">
      <h3 className="text-lg font-semibold">Search Documents</h3>

      <div className="grid gap-2">
        <Label htmlFor="queryInput">Query</Label>
        <Input
          id="queryInput"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Example: 'How to add a user in V-Track'"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="limitInput">Limit</Label>
        <Input
          id="limitInput"
          type="number"
          min={1}
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
          placeholder="Default: 3"
        />
      </div>

      <Button
        variant="default"
        onClick={handleSearch}
        disabled={loading || !query}
      >
        {loading ? 'Searching...' : 'Search'}
      </Button>

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      {results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map(doc => (
            <li key={String(doc.id)} className="rounded border p-2">
              <h4 className="text-md font-bold">
                {doc.title ?? 'Untitled'} (distance: {doc.distance.toFixed(4)})
              </h4>
              <p className="text-sm text-muted-foreground">
                {doc.content?.slice(0, 200) ?? ''}...
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}